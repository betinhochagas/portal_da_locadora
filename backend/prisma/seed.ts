import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes (exceto a filial que você criou)
  console.log('🧹 Limpando dados existentes (ordem correta para evitar FK)...');
  await prisma.cobranca.deleteMany();
  await prisma.manutencao.deleteMany();
  await prisma.historicoKm.deleteMany();
  await prisma.contrato.deleteMany();
  await prisma.contratoTemplate.deleteMany();
  await prisma.documentoDigital.deleteMany();
  await prisma.veiculo.deleteMany();
  await prisma.plano.deleteMany();
  await prisma.motorista.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();

  // Criar Filiais
  console.log('📍 Criando filiais...');
  const filialBlumenau = await prisma.filial.upsert({
    where: { cnpj: '123123123123' },
    update: {},
    create: {
      name: 'Novo',
      cnpj: '123123123123',
      phone: '21999817997',
      email: 'robertochagas.ti@gmail...',
      address: 'rua x',
      city: 'Blumenau',
      state: 'Santa Catarina',
      zipCode: '89023240',
      active: true,
    },
  });

  const filialFloripa = await prisma.filial.upsert({
    where: { cnpj: '12345678000199' },
    update: {},
    create: {
      name: 'Portal da Locadora - Florianópolis',
      cnpj: '12345678000199',
      phone: '(48) 3333-4444',
      email: 'floripa@portaldalocadora.com',
      address: 'Av. Beira Mar Norte, 1000',
      city: 'Florianópolis',
      state: 'SC',
      zipCode: '88015-600',
      active: true,
    },
  });

  // Criar Usuários
  console.log('👥 Criando usuários...');
  const hashedPassword = await bcrypt.hash('senha123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@portaldalocadora.com',
      password: hashedPassword,
      name: 'Administrador',
      role: 'ADMIN',
      active: true,
    },
  });

  const gerente = await prisma.user.create({
    data: {
      email: 'gerente.blumenau@portaldalocadora.com',
      password: hashedPassword,
      name: 'Carlos Gerente',
      role: 'GERENTE_LOJA',
      active: true,
      filialId: filialBlumenau.id,
    },
  });

  const atendente = await prisma.user.create({
    data: {
      email: 'atendente@portaldalocadora.com',
      password: hashedPassword,
      name: 'Maria Atendente',
      role: 'ATENDENTE',
      active: true,
      filialId: filialFloripa.id,
    },
  });

  // Criar Motoristas
  console.log('🚗 Criando motoristas...');
  const motorista1 = await prisma.motorista.create({
    data: {
      name: 'João da Silva',
      email: 'joao.silva@email.com',
      phone: '(48) 99999-1111',
      cpf: '123.456.789-00',
      cnh: '12345678900',
      cnhCategory: 'AB',
      cnhExpiry: new Date('2027-12-31'),
      address: 'Rua das Flores, 123',
      city: 'Florianópolis',
      state: 'SC',
      zipCode: '88010-100',
      active: true,
    },
  });

  const motorista2 = await prisma.motorista.create({
    data: {
      name: 'Maria Santos (99 Táxi)',
      email: 'maria.santos@email.com',
      phone: '(48) 98888-2222',
      cpf: '987.654.321-00',
      cnh: '98765432100',
      cnhCategory: 'B',
      cnhExpiry: new Date('2026-06-30'),
      address: 'Av. Principal, 456',
      city: 'Blumenau',
      state: 'SC',
      zipCode: '89020-000',
      bankName: 'Banco do Brasil',
      bankAgency: '1234-5',
      bankAccount: '12345-6',
      active: true,
    },
  });

  const motorista3 = await prisma.motorista.create({
    data: {
      name: 'Pedro Oliveira (Uber)',
      email: 'pedro.oliveira@email.com',
      phone: '(48) 97777-3333',
      cpf: '111.222.333-44',
      cnh: '11122233344',
      cnhCategory: 'AB',
      cnhExpiry: new Date('2028-03-15'),
      address: 'Rua do Comércio, 789',
      city: 'Florianópolis',
      state: 'SC',
      zipCode: '88015-200',
      active: true,
    },
  });

  // Criar Planos
  console.log('💰 Criando planos de locação...');
  const planoUber = await prisma.plano.create({
    data: {
      name: 'Plano Uber Mensal',
      description: 'Plano completo para motoristas Uber com KM ilimitado',
      dailyPrice: 80.0,
      weeklyPrice: 500.0,
      monthlyPrice: 1800.0,
      kmIncluded: null, // ilimitado
      includesInsurance: true,
      includesMaintenance: true,
      allowedCategories: ['HATCH', 'SEDAN'],
      active: true,
    },
  });

  const plano99 = await prisma.plano.create({
    data: {
      name: 'Plano 99 Semanal',
      description: 'Plano econômico para motoristas 99',
      dailyPrice: 70.0,
      weeklyPrice: 420.0,
      monthlyPrice: 1600.0,
      kmIncluded: 3000,
      kmExtraPrice: 0.5,
      includesInsurance: false,
      includesMaintenance: true,
      allowedCategories: ['HATCH'],
      active: true,
    },
  });

  const planoExecutivo = await prisma.plano.create({
    data: {
      name: 'Plano Executivo',
      description: 'Plano premium com veículos SUV',
      dailyPrice: 150.0,
      weeklyPrice: 900.0,
      monthlyPrice: 3200.0,
      kmIncluded: null,
      includesInsurance: true,
      includesMaintenance: true,
      allowedCategories: ['SUV', 'SEDAN'],
      active: true,
    },
  });

  // Criar Veículos
  console.log('🚙 Criando veículos...');
  const veiculo1 = await prisma.veiculo.create({
    data: {
      plate: 'ABC-1234',
      renavam: '12345678901',
      chassi: '9BWZZZ377VT004251',
      brand: 'Fiat',
      model: 'Argo',
      year: 2023,
      color: 'Branco',
      category: 'HATCH',
      fuelType: 'FLEX',
      transmission: 'MANUAL',
      doors: 4,
      km: 15000,
      status: 'DISPONIVEL',
      fipeValue: 65000.0,
      filialId: filialFloripa.id,
      active: true,
    },
  });

  const veiculo2 = await prisma.veiculo.create({
    data: {
      plate: 'DEF-5678',
      renavam: '98765432109',
      chassi: '9BWZZZ377VT004252',
      brand: 'Volkswagen',
      model: 'Gol',
      year: 2022,
      color: 'Prata',
      category: 'HATCH',
      fuelType: 'FLEX',
      transmission: 'MANUAL',
      doors: 4,
      km: 28000,
      status: 'LOCADO',
      fipeValue: 58000.0,
      filialId: filialBlumenau.id,
      active: true,
    },
  });

  const veiculo3 = await prisma.veiculo.create({
    data: {
      plate: 'GHI-9012',
      renavam: '11122233344',
      chassi: '9BWZZZ377VT004253',
      brand: 'Hyundai',
      model: 'HB20',
      year: 2024,
      color: 'Vermelho',
      category: 'HATCH',
      fuelType: 'FLEX',
      transmission: 'AUTOMATICO',
      doors: 4,
      km: 5000,
      status: 'DISPONIVEL',
      fipeValue: 72000.0,
      filialId: filialFloripa.id,
      active: true,
    },
  });

  const veiculo4 = await prisma.veiculo.create({
    data: {
      plate: 'JKL-3456',
      renavam: '55566677788',
      chassi: '9BWZZZ377VT004254',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2023,
      color: 'Preto',
      category: 'SEDAN',
      fuelType: 'FLEX',
      transmission: 'AUTOMATICO',
      doors: 4,
      km: 12000,
      status: 'DISPONIVEL',
      fipeValue: 125000.0,
      filialId: filialFloripa.id,
      active: true,
    },
  });

  const veiculo5 = await prisma.veiculo.create({
    data: {
      plate: 'MNO-7890',
      renavam: '99988877766',
      chassi: '9BWZZZ377VT004255',
      brand: 'Jeep',
      model: 'Compass',
      year: 2024,
      color: 'Branco',
      category: 'SUV',
      fuelType: 'FLEX',
      transmission: 'AUTOMATICO',
      doors: 4,
      km: 8000,
      status: 'MANUTENCAO',
      fipeValue: 185000.0,
      filialId: filialBlumenau.id,
      lastMaintenance: new Date('2025-11-15'),
      nextMaintenance: new Date('2025-12-15'),
      active: true,
    },
  });

  // Criar Contratos
  console.log('📄 Criando contratos...');
  const contrato1 = await prisma.contrato.create({
    data: {
      contractNumber: '2025-001',
      motoristaId: motorista1.id,
      veiculoId: veiculo2.id,
      planoId: planoUber.id,
      filialId: filialBlumenau.id,
      startDate: new Date('2025-11-01'),
      endDate: new Date('2026-11-01'),
      billingDay: 5,
      monthlyAmount: 1800.0,
      deposit: 2000.0,
      kmStart: 28000,
      kmCurrent: 28500,
      status: 'ATIVO',
      signedAt: new Date('2025-11-01'),
      notes: 'Motorista Uber experiente, pagamento em dia',
    },
  });

  const contrato2 = await prisma.contrato.create({
    data: {
      contractNumber: '2025-002',
      motoristaId: motorista2.id,
      veiculoId: veiculo1.id,
      planoId: plano99.id,
      filialId: filialFloripa.id,
      startDate: new Date('2025-11-10'),
      endDate: new Date('2026-05-10'),
      billingDay: 10,
      monthlyAmount: 1600.0,
      deposit: 1500.0,
      kmStart: 15000,
      status: 'RASCUNHO',
      notes: 'Aguardando assinatura do contrato',
    },
  });

  const contrato3 = await prisma.contrato.create({
    data: {
      contractNumber: '2025-003',
      motoristaId: motorista3.id,
      veiculoId: veiculo4.id,
      planoId: planoExecutivo.id,
      filialId: filialFloripa.id,
      startDate: new Date('2025-10-01'),
      endDate: new Date('2026-10-01'),
      billingDay: 1,
      monthlyAmount: 3200.0,
      deposit: 5000.0,
      kmStart: 12000,
      kmCurrent: 12300,
      status: 'ATIVO',
      signedAt: new Date('2025-10-01'),
      notes: 'Cliente premium, veículo executivo',
    },
  });

  // Criar Template de Contrato Profissional (Documento Legal para Cartório)
  console.log('📄 Criando template de contrato profissional...');
  await prisma.contratoTemplate.create({
    data: {
      titulo: 'Contrato de Locação Oficial - Portal da Locadora',
      ativo: true,
      createdBy: admin.id,
      conteudo: `CONTRATO DE LOCAÇÃO DE VEÍCULO PARA MOTORISTAS DE APLICATIVO

═══════════════════════════════════════════════════════════════════

CONTRATO Nº {{CONTRATO_NUMERO}}
Data de Emissão: {{DATA_ATUAL}}

═══════════════════════════════════════════════════════════════════

IDENTIFICAÇÃO DAS PARTES CONTRATANTES

LOCADOR:
Razão Social: PORTAL DA LOCADORA LTDA
CNPJ: 12.345.678/0001-90
Inscrição Estadual: 123.456.789
Endereço: Av. Brasil, 1000 - Sala 301 - Centro
Cidade: Blumenau - SC - CEP: 89010-000
Telefone: (47) 3333-4444
E-mail: contato@portaldalocadora.com.br
Representante Legal: Carlos Alberto Silva

LOCATÁRIO:
Nome Completo: {{MOTORISTA_NOME}}
CPF: {{MOTORISTA_CPF}}
CNH: {{MOTORISTA_CNH}} (Categoria B ou superior)
Endereço Residencial: {{MOTORISTA_ENDERECO}}
Telefone: Em cadastro
E-mail: Em cadastro

═══════════════════════════════════════════════════════════════════

OBJETO DO CONTRATO

Pelo presente instrumento particular de contrato de locação de veículo, o LOCADOR cede ao LOCATÁRIO, em regime de locação mensal, o seguinte veículo automotor para fins de trabalho como motorista de aplicativo:

IDENTIFICAÇÃO DO VEÍCULO:
• Placa: {{VEICULO_PLACA}}
• Marca/Modelo: {{VEICULO_MODELO}}
• Ano de Fabricação: Conforme documento
• Cor: {{VEICULO_COR}}
• Chassi: Conforme CRLV
• RENAVAM: Conforme CRLV
• Quilometragem Inicial: {{VEICULO_KM_INICIAL}} km

O veículo encontra-se em perfeito estado de conservação e funcionamento, conforme Laudo de Vistoria anexo a este instrumento.

═══════════════════════════════════════════════════════════════════

CLÁUSULA PRIMEIRA - DA VIGÊNCIA E RENOVAÇÃO

1.1. O presente contrato terá vigência determinada com início em {{CONTRATO_DATA_INICIO}} e término em {{CONTRATO_DATA_FIM}}, totalizando 12 (doze) meses.

1.2. Este contrato poderá ser renovado por igual período, mediante concordância expressa de ambas as partes, com antecedência mínima de 30 (trinta) dias do término da vigência.

1.3. Qualquer alteração nas condições contratuais deverá ser formalizada por meio de aditivo contratual assinado por ambas as partes.

═══════════════════════════════════════════════════════════════════

CLÁUSULA SEGUNDA - DO VALOR E CONDIÇÕES DE PAGAMENTO

2.1. VALOR MENSAL: O LOCATÁRIO pagará ao LOCADOR o valor de {{CONTRATO_VALOR_MENSAL}} (valor por extenso), referente ao PLANO {{PLANO_NOME}}.

2.2. QUILOMETRAGEM INCLUÍDA: O plano inclui {{PLANO_KM_INCLUIDO}} km/mês. Quilometragem excedente será cobrada conforme tabela vigente.

2.3. VENCIMENTO: O pagamento deverá ser efetuado até o dia 01 (um) de cada mês, via transferência bancária, PIX ou boleto bancário.

2.4. JUROS E MULTA: Em caso de atraso no pagamento, serão aplicados:
   • Multa de 2% (dois por cento) sobre o valor devido
   • Juros de mora de 1% (um por cento) ao mês, pro rata die
   • Correção monetária pelo IGPM/FGV

2.5. INADIMPLÊNCIA: O atraso superior a 15 (quinze) dias facultará ao LOCADOR a suspensão do contrato e retomada imediata do veículo.

═══════════════════════════════════════════════════════════════════

CLÁUSULA TERCEIRA - DA CAUÇÃO E GARANTIAS

3.1. VALOR DA CAUÇÃO: O LOCATÁRIO depositará, na assinatura deste contrato, o valor de {{CONTRATO_CAUCAO}} (valor por extenso) como caução garantidora.

3.2. FINALIDADE: A caução garantirá o cumprimento de todas as obrigações contratuais, incluindo:
   • Pagamentos de mensalidades
   • Reparos de danos causados por uso inadequado
   • Multas de trânsito de responsabilidade do LOCATÁRIO
   • Despesas extraordinárias não previstas

3.3. DEVOLUÇÃO: A caução será devolvida em até 30 (trinta) dias após o término do contrato, desde que:
   • O veículo seja devolvido nas mesmas condições de entrega
   • Não haja débitos pendentes
   • Não haja multas ou avarias

3.4. A caução não poderá ser utilizada para abatimento de mensalidades.

═══════════════════════════════════════════════════════════════════

CLÁUSULA QUARTA - DAS OBRIGAÇÕES DO LOCATÁRIO

4.1. São obrigações exclusivas do LOCATÁRIO:

a) UTILIZAÇÃO: Utilizar o veículo exclusivamente para trabalho como motorista de aplicativo (Uber, 99, InDrive, etc.), vedada a utilização para transporte de cargas ou atividades ilícitas;

b) CONSERVAÇÃO: Zelar pela conservação e limpeza do veículo, mantendo-o em condições adequadas de uso;

c) MANUTENÇÃO BÁSICA: Realizar revisões preventivas conforme manual do fabricante, verificar níveis de óleo, água e calibragem de pneus semanalmente;

d) COMUNICAÇÃO DE SINISTROS: Comunicar imediatamente ao LOCADOR qualquer acidente, roubo, furto ou problema mecânico, lavrando boletim de ocorrência quando necessário;

e) ABASTECIMENTO: Arcar com todas as despesas de combustível;

f) MULTAS: Responsabilizar-se por todas as multas de trânsito e infrações cometidas durante o período de locação;

g) DOCUMENTAÇÃO: Portar sempre CNH válida, CRLV e comprovante de seguro;

h) VEDAÇÕES: Não sublocar, emprestar, ceder ou transferir o veículo a terceiros sob qualquer pretexto;

i) DEVOLUÇÃO: Devolver o veículo ao término do contrato nas mesmas condições de entrega, salvo desgaste natural;

j) SEGURO: Contratar seguro complementar contra terceiros, se desejar (facultativo);

k) RASTREADOR: Não remover, desligar ou danificar o sistema de rastreamento instalado no veículo.

═══════════════════════════════════════════════════════════════════

CLÁUSULA QUINTA - DAS OBRIGAÇÕES DO LOCADOR

5.1. São obrigações do LOCADOR:

a) ENTREGA: Entregar o veículo em perfeitas condições de uso e funcionamento, com documentação regular;

b) MANUTENÇÃO CORRETIVA: Providenciar reparos em defeitos mecânicos decorrentes de desgaste natural ou problemas de fábrica, desde que comunicado em até 24 horas;

c) SEGURO: Manter o seguro obrigatório do veículo (DPVAT) em dia;

d) IPVA E LICENCIAMENTO: Arcar com despesas de IPVA, licenciamento anual e taxa de vistoria;

e) ASSISTÊNCIA: Fornecer assistência telefônica 24 horas para orientações em caso de pane ou acidente;

f) SUBSTITUIÇÃO: Fornecer veículo reserva em caso de manutenção preventiva agendada, mediante disponibilidade de frota.

═══════════════════════════════════════════════════════════════════

CLÁUSULA SEXTA - DA QUILOMETRAGEM E CONTROLE

6.1. REGISTRO SEMANAL: O LOCATÁRIO deverá registrar a quilometragem do veículo semanalmente no sistema da LOCADORA, enviando foto do hodômetro;

6.2. KM EXCEDENTE: Caso ultrapasse a quilometragem mensal incluída ({{PLANO_KM_INCLUIDO}} km/mês), será cobrado R$ 0,50 (cinquenta centavos) por quilômetro adicional;

6.3. AUDITORIA: O LOCADOR poderá solicitar vistoria do veículo a qualquer momento para conferência de quilometragem e estado de conservação.

═══════════════════════════════════════════════════════════════════

CLÁUSULA SÉTIMA - DOS SINISTROS E AVARIAS

7.1. RESPONSABILIDADE: O LOCATÁRIO será responsável por danos causados ao veículo por:
   • Uso inadequado ou negligência
   • Acidentes com culpa do LOCATÁRIO
   • Danos causados por terceiros não identificados

7.2. FRANQUIA: Em caso de sinistro coberto por seguro, o LOCATÁRIO arcará com o valor da franquia;

7.3. SEM SEGURO: Havendo danos não cobertos pelo seguro, o LOCATÁRIO pagará o valor integral do reparo, conforme orçamento de oficina credenciada;

7.4. ROUBO/FURTO: Em caso de roubo ou furto, o LOCATÁRIO deverá lavrar BO em até 24 horas e fornecer cópia ao LOCADOR.

═══════════════════════════════════════════════════════════════════

CLÁUSULA OITAVA - DA RESCISÃO E PENALIDADES

8.1. RESCISÃO PELO LOCATÁRIO: O contrato poderá ser rescindido pelo LOCATÁRIO mediante aviso prévio de 30 (trinta) dias, sem ônus adicional;

8.2. RESCISÃO PELO LOCADOR: O LOCADOR poderá rescindir o contrato imediatamente nas seguintes hipóteses:
   • Atraso superior a 15 dias no pagamento
   • Uso indevido do veículo
   • Danos intencionais
   • Sublocação não autorizada
   • Remoção do rastreador

8.3. MULTA RESCISÓRIA: Na rescisão por inadimplência do LOCATÁRIO, será aplicada multa de 20% sobre o valor restante do contrato;

8.4. DEVOLUÇÃO ANTECIPADA: Caso o veículo seja devolvido antes do término sem justa causa, não haverá devolução proporcional das mensalidades pagas.

═══════════════════════════════════════════════════════════════════

CLÁUSULA NONA - DAS DISPOSIÇÕES GERAIS

9.1. RASTREAMENTO: O veículo possui sistema de rastreamento GPS instalado para segurança de ambas as partes;

9.2. MANUTENÇÃO PREVENTIVA: O LOCADOR agendará manutenções preventivas com 7 dias de antecedência;

9.3. DOCUMENTAÇÃO: O LOCATÁRIO receberá cópia autenticada deste contrato, CRLV, apólice de seguro e termo de vistoria;

9.4. ALTERAÇÕES: Qualquer alteração neste contrato somente terá validade se formalizada por escrito e assinada por ambas as partes;

9.5. IRREVOGABILIDADE: Este contrato é irrevogável e irretratável durante sua vigência, obrigando as partes e seus sucessores.

═══════════════════════════════════════════════════════════════════

CLÁUSULA DÉCIMA - DO FORO E LEGISLAÇÃO APLICÁVEL

10.1. FORO: Fica eleito o foro da Comarca de Blumenau, Estado de Santa Catarina, para dirimir quaisquer questões ou controvérsias oriundas deste contrato, renunciando as partes a qualquer outro, por mais privilegiado que seja;

10.2. LEGISLAÇÃO: Este contrato rege-se pelas disposições do Código Civil Brasileiro (Lei 10.406/2002) e pelo Código de Defesa do Consumidor (Lei 8.078/1990), no que couber.

═══════════════════════════════════════════════════════════════════

DECLARAÇÃO DE CIÊNCIA E CONCORDÂNCIA

Declaro, para os devidos fins, que li na íntegra todas as cláusulas deste contrato, estando plenamente ciente e de acordo com seus termos e condições, não restando dúvidas quanto ao seu conteúdo.

E por estarem assim justos e contratados, firmam o presente instrumento em 2 (duas) vias de igual teor e forma, na presença de 2 (duas) testemunhas, para que produza seus jurídicos e legais efeitos.

═══════════════════════════════════════════════════════════════════

Blumenau/SC, {{DATA_ATUAL}}


_________________________________          _________________________________
PORTAL DA LOCADORA LTDA                    {{MOTORISTA_NOME}}
CNPJ: 12.345.678/0001-90                   CPF: {{MOTORISTA_CPF}}
Representante Legal                        LOCATÁRIO


TESTEMUNHAS:

1) _________________________________        2) _________________________________
   Nome:                                      Nome:
   CPF:                                       CPF:


═══════════════════════════════════════════════════════════════════

ANEXOS OBRIGATÓRIOS:
□ Laudo de Vistoria do Veículo (com fotos)
□ Cópia do CRLV
□ Cópia da CNH do LOCATÁRIO
□ Comprovante de Residência do LOCATÁRIO
□ Apólice de Seguro do Veículo
□ Termo de Responsabilidade sobre Multas

═══════════════════════════════════════════════════════════════════

OBSERVAÇÕES IMPORTANTES:

★ Este contrato é válido para reconhecimento de firma em cartório
★ O veículo não pode ser utilizado para transporte de cargas ou passageiros fora de aplicativos
★ Assistência 24h: (47) 99999-9999
★ Central de Atendimento: contato@portaldalocadora.com.br
★ Site: www.portaldalocadora.com.br

═══════════════════════════════════════════════════════════════════

VERSÃO DO CONTRATO: 2.0
ÚLTIMA ATUALIZAÇÃO: Novembro/2025
DOCUMENTO GERADO PELO SISTEMA: Portal da Locadora - Gestão Inteligente`,
    },
  });

  console.log('✅ Seed concluído com sucesso!');
  console.log('\n📊 Dados criados:');
  console.log(`  - ${2} Filiais`);
  console.log(`  - ${3} Usuários (admin, gerente, atendente)`);
  console.log(`  - ${3} Motoristas`);
  console.log(`  - ${3} Planos`);
  console.log(`  - ${5} Veículos`);
  console.log(`  - ${3} Contratos`);
  console.log(`  - ${1} Template de Contrato`);
  console.log('\n🔑 Credenciais de acesso:');
  console.log('  Email: admin@portaldalocadora.com');
  console.log('  Email: gerente.blumenau@portaldalocadora.com');
  console.log('  Email: atendente@portaldalocadora.com');
  console.log('  Senha: senha123 (todos)');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
