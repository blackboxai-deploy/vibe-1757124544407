'use client';

import { useState, useEffect, useCallback } from 'react';
import { LoanDetails, PaymentInfo, LoanCalculatorState } from '@/types/loan';
import { 
  generateAmortizationSchedule, 
  calculateLoanSummary, 
  updatePaymentStatus,
  togglePaymentLock,
  bulkUpdatePayments
} from '@/lib/loanCalculations';

interface UseLoanCalculatorProps {
  initialLoanDetails?: Partial<LoanDetails>;
  onSave?: (loanDetails: LoanDetails, payments: PaymentInfo[]) => void;
}

export function useLoanCalculator({ 
  initialLoanDetails, 
  onSave 
}: UseLoanCalculatorProps = {}) {
  const [state, setState] = useState<LoanCalculatorState>({
    loanDetails: {
      id: crypto.randomUUID(),
      principal: initialLoanDetails?.principal || 100000,
      interestRate: initialLoanDetails?.interestRate || 5.5,
      termMonths: initialLoanDetails?.termMonths || 360,
      startDate: initialLoanDetails?.startDate || new Date(),
      description: initialLoanDetails?.description || '',
      loanSource: initialLoanDetails?.loanSource || '',
      createdAt: initialLoanDetails?.createdAt || new Date(),
      updatedAt: new Date(),
      ...initialLoanDetails,
    },
    amortizationSchedule: null,
    loanSummary: null,
    selectedPayments: [],
    isCalculating: false,
    errors: {},
  });

  // Calculate amortization schedule whenever loan details change
  const calculateSchedule = useCallback(() => {
    const { loanDetails } = state;
    
    // Validate inputs
    const errors: Record<string, string> = {};
    
    if (loanDetails.principal <= 0) {
      errors.principal = 'Principal amount must be greater than 0';
    }
    if (loanDetails.interestRate < 0) {
      errors.interestRate = 'Interest rate cannot be negative';
    }
    if (loanDetails.termMonths <= 0) {
      errors.termMonths = 'Loan term must be greater than 0';
    }

    if (Object.keys(errors).length > 0) {
      setState(prev => ({ ...prev, errors, amortizationSchedule: null, loanSummary: null }));
      return;
    }

    setState(prev => ({ ...prev, isCalculating: true, errors: {} }));

    // Use setTimeout to prevent UI blocking
    setTimeout(() => {
      try {
        const schedule = generateAmortizationSchedule(loanDetails);
        const summary = calculateLoanSummary(loanDetails, schedule);
        
        setState(prev => ({
          ...prev,
          amortizationSchedule: schedule,
          loanSummary: summary,
          isCalculating: false,
        }));
      } catch (error) {
        console.error('Calculation error:', error);
        setState(prev => ({
          ...prev,
          isCalculating: false,
          errors: { general: 'Failed to calculate loan schedule' },
        }));
      }
    }, 0);
  }, [state.loanDetails]);

  // Recalculate when loan details change
  useEffect(() => {
    calculateSchedule();
  }, [
    state.loanDetails.principal,
    state.loanDetails.interestRate,
    state.loanDetails.termMonths,
    state.loanDetails.startDate
  ]);

  // Update loan details
  const updateLoanDetails = useCallback((updates: Partial<LoanDetails>) => {
    setState(prev => ({
      ...prev,
      loanDetails: {
        ...prev.loanDetails,
        ...updates,
        updatedAt: new Date(),
      },
    }));
  }, []);

  // Update payment status
  const updatePayment = useCallback((
    paymentNumber: number,
    isPaid: boolean,
    paidDate?: Date,
    notes?: string
  ) => {
    setState(prev => {
      if (!prev.amortizationSchedule) return prev;

      const updatedPayments = updatePaymentStatus(
        prev.amortizationSchedule.payments,
        paymentNumber,
        isPaid,
        paidDate,
        notes
      );

      const updatedSchedule = {
        ...prev.amortizationSchedule,
        payments: updatedPayments,
      };

      const updatedSummary = calculateLoanSummary(prev.loanDetails, updatedSchedule);

      // Auto-save if callback provided
      if (onSave) {
        onSave(prev.loanDetails, updatedPayments);
      }

      return {
        ...prev,
        amortizationSchedule: updatedSchedule,
        loanSummary: updatedSummary,
      };
    });
  }, [onSave]);

  // Toggle payment lock
  const toggleLock = useCallback((paymentNumber: number) => {
    setState(prev => {
      if (!prev.amortizationSchedule) return prev;

      const updatedPayments = togglePaymentLock(
        prev.amortizationSchedule.payments,
        paymentNumber
      );

      const updatedSchedule = {
        ...prev.amortizationSchedule,
        payments: updatedPayments,
      };

      // Auto-save if callback provided
      if (onSave) {
        onSave(prev.loanDetails, updatedPayments);
      }

      return {
        ...prev,
        amortizationSchedule: updatedSchedule,
      };
    });
  }, [onSave]);

  // Bulk update payments
  const bulkUpdatePaymentStatus = useCallback((
    paymentNumbers: number[],
    isPaid: boolean,
    paidDate?: Date,
    notes?: string
  ) => {
    setState(prev => {
      if (!prev.amortizationSchedule) return prev;

      const updatedPayments = bulkUpdatePayments(
        prev.amortizationSchedule.payments,
        paymentNumbers,
        isPaid,
        paidDate,
        notes
      );

      const updatedSchedule = {
        ...prev.amortizationSchedule,
        payments: updatedPayments,
      };

      const updatedSummary = calculateLoanSummary(prev.loanDetails, updatedSchedule);

      // Auto-save if callback provided
      if (onSave) {
        onSave(prev.loanDetails, updatedPayments);
      }

      return {
        ...prev,
        amortizationSchedule: updatedSchedule,
        loanSummary: updatedSummary,
        selectedPayments: [], // Clear selection after bulk update
      };
    });
  }, [onSave]);

  // Select/deselect payments
  const togglePaymentSelection = useCallback((paymentNumber: number) => {
    setState(prev => ({
      ...prev,
      selectedPayments: prev.selectedPayments.includes(paymentNumber)
        ? prev.selectedPayments.filter(n => n !== paymentNumber)
        : [...prev.selectedPayments, paymentNumber],
    }));
  }, []);

  // Clear payment selection
  const clearSelection = useCallback(() => {
    setState(prev => ({ ...prev, selectedPayments: [] }));
  }, []);

  // Load existing loan data
  const loadLoanData = useCallback((loanDetails: LoanDetails, payments: PaymentInfo[]) => {
    // Reconstruct the amortization schedule with existing payment data
    const baseSchedule = generateAmortizationSchedule(loanDetails);
    const mergedPayments = baseSchedule.payments.map(basePayment => {
      const existingPayment = payments.find(p => p.paymentNumber === basePayment.paymentNumber);
      return existingPayment ? { ...basePayment, ...existingPayment } : basePayment;
    });

    const updatedSchedule = {
      ...baseSchedule,
      payments: mergedPayments,
    };

    const summary = calculateLoanSummary(loanDetails, updatedSchedule);

    setState({
      loanDetails,
      amortizationSchedule: updatedSchedule,
      loanSummary: summary,
      selectedPayments: [],
      isCalculating: false,
      errors: {},
    });
  }, []);

  return {
    ...state,
    updateLoanDetails,
    updatePayment,
    toggleLock,
    bulkUpdatePaymentStatus,
    togglePaymentSelection,
    clearSelection,
    loadLoanData,
    recalculate: calculateSchedule,
  };
}