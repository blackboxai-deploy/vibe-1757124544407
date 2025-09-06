export interface LoanDetails {
  id: string;
  principal: number;
  interestRate: number;
  termMonths: number;
  startDate: Date;
  description: string;
  loanSource: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentInfo {
  paymentNumber: number;
  dueDate: Date;
  principalAmount: number;
  interestAmount: number;
  totalPayment: number;
  remainingBalance: number;
  isPaid: boolean;
  paidDate?: Date;
  isLocked: boolean;
  notes?: string;
}

export interface AmortizationSchedule {
  monthlyPayment: number;
  totalInterest: number;
  totalAmount: number;
  payments: PaymentInfo[];
}

export interface LoanSummary {
  monthlyPayment: number;
  totalInterest: number;
  totalAmount: number;
  remainingBalance: number;
  paidAmount: number;
  paidPayments: number;
  totalPayments: number;
  completionDate: Date;
  progressPercentage: number;
}

export interface LoanCalculatorState {
  loanDetails: LoanDetails;
  amortizationSchedule: AmortizationSchedule | null;
  loanSummary: LoanSummary | null;
  selectedPayments: number[];
  isCalculating: boolean;
  errors: Record<string, string>;
}

export type PaymentStatus = 'paid' | 'unpaid' | 'locked-paid' | 'locked-unpaid';

export interface BulkPaymentUpdate {
  paymentNumbers: number[];
  status: 'paid' | 'unpaid';
  paidDate?: Date;
  notes?: string;
}