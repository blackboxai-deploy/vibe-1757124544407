'use client';

import { useState, useEffect } from 'react';
import { LoanDetails, PaymentInfo } from '@/types/loan';

interface StoredLoanData {
  loanDetails: LoanDetails;
  payments: PaymentInfo[];
}

export function useLoanStorage() {
  const [storedLoans, setStoredLoans] = useState<Record<string, StoredLoanData>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('loanCalculatorData');
      if (stored) {
        const parsedData = JSON.parse(stored);
        // Convert date strings back to Date objects
        Object.keys(parsedData).forEach(loanId => {
          const loan = parsedData[loanId];
          loan.loanDetails.startDate = new Date(loan.loanDetails.startDate);
          loan.loanDetails.createdAt = new Date(loan.loanDetails.createdAt);
          loan.loanDetails.updatedAt = new Date(loan.loanDetails.updatedAt);
          
          loan.payments.forEach((payment: PaymentInfo) => {
            payment.dueDate = new Date(payment.dueDate);
            if (payment.paidDate) {
              payment.paidDate = new Date(payment.paidDate);
            }
          });
        });
        setStoredLoans(parsedData);
      }
    } catch (error) {
      console.error('Failed to load loan data from localStorage:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save data to localStorage whenever storedLoans changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('loanCalculatorData', JSON.stringify(storedLoans));
      } catch (error) {
        console.error('Failed to save loan data to localStorage:', error);
      }
    }
  }, [storedLoans, isLoaded]);

  const saveLoan = (loanDetails: LoanDetails, payments: PaymentInfo[]) => {
    const updatedLoanDetails = {
      ...loanDetails,
      updatedAt: new Date(),
    };

    setStoredLoans(prev => ({
      ...prev,
      [loanDetails.id]: {
        loanDetails: updatedLoanDetails,
        payments,
      },
    }));
  };

  const loadLoan = (loanId: string): StoredLoanData | null => {
    return storedLoans[loanId] || null;
  };

  const deleteLoan = (loanId: string) => {
    setStoredLoans(prev => {
      const updated = { ...prev };
      delete updated[loanId];
      return updated;
    });
  };

  const getAllLoans = (): StoredLoanData[] => {
    return Object.values(storedLoans);
  };

  const updatePayments = (loanId: string, payments: PaymentInfo[]) => {
    setStoredLoans(prev => {
      const loan = prev[loanId];
      if (!loan) return prev;

      return {
        ...prev,
        [loanId]: {
          ...loan,
          loanDetails: {
            ...loan.loanDetails,
            updatedAt: new Date(),
          },
          payments,
        },
      };
    });
  };

  const exportData = (): string => {
    return JSON.stringify(storedLoans, null, 2);
  };

  const importData = (jsonData: string): boolean => {
    try {
      const parsedData = JSON.parse(jsonData);
      
      // Validate the structure
      Object.keys(parsedData).forEach(loanId => {
        const loan = parsedData[loanId];
        if (!loan.loanDetails || !Array.isArray(loan.payments)) {
          throw new Error('Invalid data structure');
        }
        
        // Convert date strings to Date objects
        loan.loanDetails.startDate = new Date(loan.loanDetails.startDate);
        loan.loanDetails.createdAt = new Date(loan.loanDetails.createdAt);
        loan.loanDetails.updatedAt = new Date(loan.loanDetails.updatedAt);
        
        loan.payments.forEach((payment: PaymentInfo) => {
          payment.dueDate = new Date(payment.dueDate);
          if (payment.paidDate) {
            payment.paidDate = new Date(payment.paidDate);
          }
        });
      });

      setStoredLoans(parsedData);
      return true;
    } catch (error) {
      console.error('Failed to import loan data:', error);
      return false;
    }
  };

  const clearAllData = () => {
    setStoredLoans({});
    localStorage.removeItem('loanCalculatorData');
  };

  return {
    storedLoans,
    isLoaded,
    saveLoan,
    loadLoan,
    deleteLoan,
    getAllLoans,
    updatePayments,
    exportData,
    importData,
    clearAllData,
  };
}