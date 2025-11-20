import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes (exceto a filial que você criou)
  console.log('🧹 Limpando contratos, veículos, planos e motoristas...');
  await prisma.contrato.deleteMany();
  await prisma.veiculo.deleteMany();
  await prisma.plano.deleteMany();
  await prisma.motorista.deleteMany();
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

  const filialFloripa = await prisma.filial.create({
    data: {
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

  console.log('✅ Seed concluído com sucesso!');
  console.log('\n📊 Dados criados:');
  console.log(`  - ${2} Filiais`);
  console.log(`  - ${3} Usuários (admin, gerente, atendente)`);
  console.log(`  - ${3} Motoristas`);
  console.log(`  - ${3} Planos`);
  console.log(`  - ${5} Veículos`);
  console.log(`  - ${3} Contratos`);
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
