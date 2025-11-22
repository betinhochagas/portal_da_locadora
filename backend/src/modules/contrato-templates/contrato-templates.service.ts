import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';

@Injectable()
export class ContratoTemplatesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Lista todos os templates
   */
  async findAll() {
    return this.prisma.contratoTemplate.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Busca template ativo
   */
  async findAtivo() {
    const template = await this.prisma.contratoTemplate.findFirst({
      where: { ativo: true },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!template) {
      throw new NotFoundException('Nenhum template ativo encontrado');
    }

    return template;
  }

  /**
   * Busca template por ID
   */
  async findOne(id: string) {
    const template = await this.prisma.contratoTemplate.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!template) {
      throw new NotFoundException(`Template com ID ${id} não encontrado`);
    }

    return template;
  }

  /**
   * Cria novo template
   */
  async create(dto: CreateTemplateDto, userId: string) {
    return this.prisma.contratoTemplate.create({
      data: {
        ...dto,
        createdBy: userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Atualiza template
   */
  async update(id: string, dto: UpdateTemplateDto) {
    // Verificar se existe
    await this.findOne(id);

    return this.prisma.contratoTemplate.update({
      where: { id },
      data: dto,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Ativa um template (desativa todos os outros)
   */
  async ativar(id: string) {
    // Verificar se existe
    await this.findOne(id);

    // Desativar todos os templates
    await this.prisma.contratoTemplate.updateMany({
      where: { ativo: true },
      data: { ativo: false },
    });

    // Ativar o template selecionado
    return this.prisma.contratoTemplate.update({
      where: { id },
      data: { ativo: true },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Remove template
   */
  async remove(id: string) {
    // Verificar se existe
    const template = await this.findOne(id);

    // Impedir exclusão de template ativo
    if (template.ativo) {
      throw new BadRequestException(
        'Não é possível excluir o template ativo. Ative outro template primeiro.',
      );
    }

    await this.prisma.contratoTemplate.delete({
      where: { id },
    });

    return { message: 'Template excluído com sucesso' };
  }
}
