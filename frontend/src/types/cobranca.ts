export const PaymentStatus = {
  PENDENTE: 'PENDENTE',
  PAGA: 'PAGA',
  ATRASADA: 'ATRASADA',
  CANCELADA: 'CANCELADA',
} as const;

export type PaymentStatus = typeof PaymentStatus[keyof typeof PaymentStatus];

export interface Cobranca {
  id: string;
  contratoId: string;
  referenceMonth: string; // YYYY-MM
  dueDate: string;
  amount: number;
  status: PaymentStatus;
  paymentDate: string | null;
  paymentMethod: string | null;
  daysLate: number;
  lateFee: number | null;
  observations: string | null;
  createdAt: string;
  updatedAt: string;
  contrato?: {
    id: string;
    contractNumber: string;
    monthlyAmount: number;
    status: string;
    motorista: {
      id: string;
      name: string;
      phone: string;
      cpf: string | null;
      cnpj: string | null;
    };
    veiculo: {
      id: string;
      plate: string;
      brand: string;
      model: string;
    };
    plano: {
      id: string;
      name: string;
    };
  };
}

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDENTE]: 'Pendente',
  [PaymentStatus.PAGA]: 'Paga',
  [PaymentStatus.ATRASADA]: 'Atrasada',
  [PaymentStatus.CANCELADA]: 'Cancelada',
};

export const paymentStatusColors: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDENTE]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  [PaymentStatus.PAGA]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  [PaymentStatus.ATRASADA]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  [PaymentStatus.CANCELADA]: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
};
