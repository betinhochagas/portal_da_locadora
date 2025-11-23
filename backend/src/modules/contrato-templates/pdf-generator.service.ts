import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

// Define types for pdfMake configuration
interface PdfMakeInstance {
  vfs?: Record<string, string>;
  createPdf: (documentDefinition: unknown) => unknown;
}

interface PdfFontsModule {
  pdfMake?: { vfs?: Record<string, string> };
  vfs?: Record<string, string>;
}

// Configurar fontes do pdfmake - múltiplas tentativas para diferentes versões
const fontsModule = pdfFonts as unknown as PdfFontsModule;
const pdfInstance = pdfMake as unknown as PdfMakeInstance;

if (fontsModule.pdfMake?.vfs) {
  pdfInstance.vfs = fontsModule.pdfMake.vfs;
} else if (fontsModule.vfs) {
  pdfInstance.vfs = fontsModule.vfs;
} else {
  // Fallback: usar vfs diretamente se existir
  const defaultVfs = (pdfFonts as { vfs?: Record<string, string> }).vfs;
  if (defaultVfs) pdfInstance.vfs = defaultVfs;
}

interface ContratoDados {
  motoristaNome: string;
  motoristaCpf: string;
  motoristaCnh: string;
  motoristaEndereco: string;
  veiculoPlaca: string;
  veiculoModelo: string;
  veiculoCor: string;
  veiculoKmInicial: string;
  contratoNumero: string;
  contratoDataInicio: string;
  contratoDataFim: string;
  contratoValorMensal: string;
  contratoCaucao: string;
  planoNome: string;
  planoKmIncluido: string;
  dataAtual: string;
}

@Injectable()
export class PdfGeneratorService {
  constructor(private prisma: PrismaService) {}

  /**
   * Gera PDF do contrato
   */
  async gerarContratoPDF(
    contratoId: string,
    templateId?: string,
  ): Promise<Buffer> {
    // Buscar contrato com relacionamentos
    const contrato = await this.prisma.contrato.findUnique({
      where: { id: contratoId },
      include: {
        motorista: true,
        veiculo: true,
        plano: true,
      },
    });

    if (!contrato) {
      throw new NotFoundException(
        `Contrato com ID ${contratoId} não encontrado`,
      );
    }

    // Verificar se o contrato tem todos os dados necessários
    if (!contrato.motorista) {
      throw new NotFoundException(
        `Contrato ${contrato.contractNumber} não possui motorista associado`,
      );
    }
    if (!contrato.veiculo) {
      throw new NotFoundException(
        `Contrato ${contrato.contractNumber} não possui veículo associado`,
      );
    }
    if (!contrato.plano) {
      throw new NotFoundException(
        `Contrato ${contrato.contractNumber} não possui plano associado`,
      );
    }

    // Buscar template (específico ou ativo)
    let template: { conteudo: string; titulo: string } | null;
    if (templateId) {
      template = await this.prisma.contratoTemplate.findUnique({
        where: { id: templateId },
      });
      if (!template) {
        throw new NotFoundException(
          `Template com ID ${templateId} não encontrado`,
        );
      }
    } else {
      template = await this.prisma.contratoTemplate.findFirst({
        where: { ativo: true },
        orderBy: { createdAt: 'desc' },
      });
      if (!template) {
        throw new NotFoundException(
          'Nenhum template ativo encontrado. Por favor, acesse /templates e ative ao menos um template de contrato antes de gerar o PDF.',
        );
      }
    }

    // Preparar dados para substituição
    const dados: ContratoDados = {
      motoristaNome: contrato.motorista.name,
      motoristaCpf: this.formatCPF(contrato.motorista.cpf || ''),
      motoristaCnh: contrato.motorista.cnh,
      motoristaEndereco: this.formatEndereco(
        contrato.motorista.address,
        contrato.motorista.city,
        contrato.motorista.state,
        contrato.motorista.zipCode,
      ),
      veiculoPlaca: contrato.veiculo.plate,
      veiculoModelo: `${contrato.veiculo.brand} ${contrato.veiculo.model} ${contrato.veiculo.year}`,
      veiculoCor: contrato.veiculo.color,
      veiculoKmInicial: (contrato.kmStart || 0).toLocaleString('pt-BR'),
      contratoNumero: contrato.contractNumber,
      contratoDataInicio: this.formatDate(contrato.startDate),
      contratoDataFim: this.formatDate(contrato.endDate),
      contratoValorMensal: this.formatCurrency(
        Number(contrato.monthlyAmount) || 0,
      ),
      contratoCaucao: this.formatCurrency(Number(contrato.deposit) || 0),
      planoNome: contrato.plano.name,
      planoKmIncluido: (contrato.plano.kmIncluded || 0).toLocaleString('pt-BR'),
      dataAtual: this.formatDate(new Date()),
    };

    // Substituir placeholders
    const conteudoFinal = this.substituirPlaceholders(template.conteudo, dados);

    // Gerar PDF
    const pdfBuffer = await this.gerarPDF(
      conteudoFinal,
      contrato.contractNumber || 'S/N',
    );

    return pdfBuffer;
  }

  /**
   * Substitui placeholders no texto
   */
  private substituirPlaceholders(texto: string, dados: ContratoDados): string {
    return texto
      .replace(/\{\{MOTORISTA_NOME\}\}/g, dados.motoristaNome)
      .replace(/\{\{MOTORISTA_CPF\}\}/g, dados.motoristaCpf)
      .replace(/\{\{MOTORISTA_CNH\}\}/g, dados.motoristaCnh)
      .replace(/\{\{MOTORISTA_ENDERECO\}\}/g, dados.motoristaEndereco)
      .replace(/\{\{VEICULO_PLACA\}\}/g, dados.veiculoPlaca)
      .replace(/\{\{VEICULO_MODELO\}\}/g, dados.veiculoModelo)
      .replace(/\{\{VEICULO_COR\}\}/g, dados.veiculoCor)
      .replace(/\{\{VEICULO_KM_INICIAL\}\}/g, dados.veiculoKmInicial)
      .replace(/\{\{CONTRATO_NUMERO\}\}/g, dados.contratoNumero)
      .replace(/\{\{CONTRATO_DATA_INICIO\}\}/g, dados.contratoDataInicio)
      .replace(/\{\{CONTRATO_DATA_FIM\}\}/g, dados.contratoDataFim)
      .replace(/\{\{CONTRATO_VALOR_MENSAL\}\}/g, dados.contratoValorMensal)
      .replace(/\{\{CONTRATO_CAUCAO\}\}/g, dados.contratoCaucao)
      .replace(/\{\{PLANO_NOME\}\}/g, dados.planoNome)
      .replace(/\{\{PLANO_KM_INCLUIDO\}\}/g, dados.planoKmIncluido)
      .replace(/\{\{DATA_ATUAL\}\}/g, dados.dataAtual);
  }

  /**
   * Gera o PDF com pdfmake
   */
  private async gerarPDF(
    conteudo: string,
    _numeroContrato: string,
  ): Promise<Buffer> {
    // Dividir conteúdo em linhas
    const linhas = conteudo.split('\n');

    // Criar array de content para o PDF
    const content = linhas.map((linha) => {
      const trimmed = linha.trim();

      // Título principal (primeira linha ou linhas em maiúsculas)
      if (
        trimmed === trimmed.toUpperCase() &&
        trimmed.length > 0 &&
        trimmed.length < 50
      ) {
        return {
          text: trimmed,
          style: 'header',
          margin: [0, 10, 0, 10] as [number, number, number, number],
        };
      }

      // Linha vazia
      if (trimmed.length === 0) {
        return {
          text: '',
          margin: [0, 5, 0, 5] as [number, number, number, number],
        };
      }

      // Linha normal
      return {
        text: trimmed,
        style: 'normal',
        margin: [0, 2, 0, 2] as [number, number, number, number],
      };
    });

    const docDefinition = {
      content,
      styles: {
        header: {
          fontSize: 16,
          bold: true,
          alignment: 'center' as const,
        },
        normal: {
          fontSize: 11,
          alignment: 'justify' as const,
        },
      },
      pageMargins: [60, 60, 60, 60] as [number, number, number, number],
    };

    return new Promise((resolve, _reject) => {
      const pdfDoc = pdfMake.createPdf(docDefinition);
      pdfDoc.getBuffer((buffer: Buffer) => {
        resolve(buffer);
      });
    });
  }

  /**
   * Formata CPF
   */
  private formatCPF(cpf: string): string {
    if (!cpf || cpf.length !== 11) return 'N/A';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  /**
   * Formata data
   */
  private formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('pt-BR');
  }

  /**
   * Formata moeda
   */
  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  /**
   * Formata endereço completo
   */
  private formatEndereco(
    address: string | null,
    city: string | null,
    state: string | null,
    zipCode: string | null,
  ): string {
    const parts = [address, city, state, zipCode].filter((p) => p);
    return parts.length > 0 ? parts.join(', ') : 'N/A';
  }
}
