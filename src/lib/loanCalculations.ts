import { LoanDetails, PaymentInfo, AmortizationSchedule, LoanSummary } from '@/types/loan';
import { addMonths } from 'date-fns';

export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  termMonths: number
): number {
  if (annualRate === 0) {
    return principal / termMonths;
  }
  
  const monthlyRate = annualRate / 100 / 12;
  const numerator = principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths);
  const denominator = Math.pow(1 + monthlyRate, termMonths) - 1;
  
  return numerator / denominator;
}

export function generateAmortizationSchedule(loanDetails: LoanDetails): AmortizationSchedule {
  const { principal, interestRate, termMonths, startDate } = loanDetails;
  const monthlyPayment = calculateMonthlyPayment(principal, interestRate, termMonths);
  const monthlyRate = interestRate / 100 / 12;
  
  let remainingBalance = principal;
  const payments: PaymentInfo[] = [];
  let totalInterest = 0;
  
  for (let paymentNumber = 1; paymentNumber <= termMonths; paymentNumber++) {
    const interestAmount = remainingBalance * monthlyRate;
    const principalAmount = monthlyPayment - interestAmount;
    
    remainingBalance -= principalAmount;
    totalInterest += interestAmount;
    
    // Ensure remaining balance doesn't go negative due to floating point precision
    if (remainingBalance < 0.01) {
      remainingBalance = 0;
    }
    
    const dueDate = addMonths(startDate, paymentNumber - 1);
    
    payments.push({
      paymentNumber,
      dueDate,
      principalAmount: Math.round(principalAmount * 100) / 100,
      interestAmount: Math.round(interestAmount * 100) / 100,
      totalPayment: Math.round(monthlyPayment * 100) / 100,
      remainingBalance: Math.round(remainingBalance * 100) / 100,
      isPaid: false,
      isLocked: false,
    });
  }
  
  return {
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    totalAmount: Math.round((principal + totalInterest) * 100) / 100,
    payments,
  };
}

export function calculateLoanSummary(
  loanDetails: LoanDetails,
  amortizationSchedule: AmortizationSchedule
): LoanSummary {
  const paidPayments = amortizationSchedule.payments.filter(p => p.isPaid).length;
  const paidAmount = amortizationSchedule.payments
    .filter(p => p.isPaid)
    .reduce((sum, payment) => sum + payment.totalPayment, 0);
  
  const remainingPayments = amortizationSchedule.payments.filter(p => !p.isPaid);
  const remainingBalance = remainingPayments.reduce((sum, payment) => sum + payment.principalAmount, 0);
  
  const progressPercentage = (paidPayments / amortizationSchedule.payments.length) * 100;
  
  // Calculate completion date based on last unpaid payment
  const lastUnpaidPayment = remainingPayments[remainingPayments.length - 1];
  const completionDate = lastUnpaidPayment ? lastUnpaidPayment.dueDate : loanDetails.startDate;
  
  return {
    monthlyPayment: amortizationSchedule.monthlyPayment,
    totalInterest: amortizationSchedule.totalInterest,
    totalAmount: amortizationSchedule.totalAmount,
    remainingBalance: Math.round(remainingBalance * 100) / 100,
    paidAmount: Math.round(paidAmount * 100) / 100,
    paidPayments,
    totalPayments: amortizationSchedule.payments.length,
    completionDate,
    progressPercentage: Math.round(progressPercentage * 100) / 100,
  };
}

export function updatePaymentStatus(
  payments: PaymentInfo[],
  paymentNumber: number,
  isPaid: boolean,
  paidDate?: Date,
  notes?: string
): PaymentInfo[] {
  return payments.map(payment => {
    if (payment.paymentNumber === paymentNumber) {
      return {
        ...payment,
        isPaid,
        paidDate: isPaid ? (paidDate || new Date()) : undefined,
        notes,
      };
    }
    return payment;
  });
}

export function togglePaymentLock(
  payments: PaymentInfo[],
  paymentNumber: number
): PaymentInfo[] {
  return payments.map(payment => {
    if (payment.paymentNumber === paymentNumber) {
      return {
        ...payment,
        isLocked: !payment.isLocked,
      };
    }
    return payment;
  });
}

export function bulkUpdatePayments(
  payments: PaymentInfo[],
  paymentNumbers: number[],
  isPaid: boolean,
  paidDate?: Date,
  notes?: string
): PaymentInfo[] {
  return payments.map(payment => {
    if (paymentNumbers.includes(payment.paymentNumber) && !payment.isLocked) {
      return {
        ...payment,
        isPaid,
        paidDate: isPaid ? (paidDate || new Date()) : undefined,
        notes,
      };
    }
    return payment;
  });
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercentage(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`;
}