'use client';

import { useState } from 'react';
import { LoanCalculator } from '@/components/LoanCalculator';
import { LoanDetails } from '@/components/LoanDetails';
import { PaymentTracker } from '@/components/PaymentTracker';
import { PaymentSchedule } from '@/components/PaymentSchedule';
import { ExportOptions } from '@/components/ExportOptions';
import { useLoanCalculator } from '@/hooks/useLoanCalculator';
import { useLoanStorage } from '@/hooks/useLoanStorage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, formatPercentage } from '@/lib/loanCalculations';

export default function HomePage() {
  const { saveLoan, loadLoan, getAllLoans } = useLoanStorage();
  const [savedLoans, setSavedLoans] = useState(getAllLoans());
  const [currentLoanId, setCurrentLoanId] = useState<string | null>(null);

  const loanCalculator = useLoanCalculator({
    onSave: (loanDetails, payments) => {
      saveLoan(loanDetails, payments);
      setSavedLoans(getAllLoans());
    },
  });

  const {
    loanDetails,
    amortizationSchedule,
    loanSummary,
    selectedPayments,
    isCalculating,
    errors,
    updateLoanDetails,
    updatePayment,
    toggleLock,
    bulkUpdatePaymentStatus,
    togglePaymentSelection,
    clearSelection,
    loadLoanData,
  } = loanCalculator;

  const handleLoadLoan = (loanId: string) => {
    const savedLoan = loadLoan(loanId);
    if (savedLoan) {
      loadLoanData(savedLoan.loanDetails, savedLoan.payments);
      setCurrentLoanId(loanId);
    }
  };

  const handleNewLoan = () => {
    // Reset to default state
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Header Summary */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-700">Monthly Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {loanSummary ? formatCurrency(loanSummary.monthlyPayment) : formatCurrency(0)}
            </div>
            <p className="text-xs text-blue-600 mt-1">
              {loanDetails.termMonths} months @ {loanDetails.interestRate}%
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-700">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {loanSummary ? formatPercentage(loanSummary.progressPercentage) : '0.00%'}
            </div>
            <Progress 
              value={loanSummary?.progressPercentage || 0} 
              className="mt-2 h-2"
            />
            <p className="text-xs text-green-600 mt-1">
              {loanSummary ? loanSummary.paidPayments : 0} of {loanSummary ? loanSummary.totalPayments : 0} payments
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-orange-700">Total Interest</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">
              {loanSummary ? formatCurrency(loanSummary.totalInterest) : formatCurrency(0)}
            </div>
            <p className="text-xs text-orange-600 mt-1">
              Over {Math.floor(loanDetails.termMonths / 12)} years
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-700">Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {loanSummary ? formatCurrency(loanSummary.remainingBalance) : formatCurrency(loanDetails.principal)}
            </div>
            <p className="text-xs text-purple-600 mt-1">
              Balance left to pay
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Saved Loans */}
      {savedLoans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Saved Loans
              <Button onClick={handleNewLoan} variant="outline" size="sm">
                New Loan
              </Button>
            </CardTitle>
            <CardDescription>
              Load a previously saved loan calculation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {savedLoans.map((loan) => (
                <Badge
                  key={loan.loanDetails.id}
                  variant={currentLoanId === loan.loanDetails.id ? "default" : "secondary"}
                  className="cursor-pointer p-2 text-sm"
                  onClick={() => handleLoadLoan(loan.loanDetails.id)}
                >
                  {loan.loanDetails.description || 'Untitled Loan'} - {formatCurrency(loan.loanDetails.principal)}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="calculator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="tracker">Payment Tracker</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="details">Loan Details</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator">
          <LoanCalculator
            loanDetails={loanDetails}
            amortizationSchedule={amortizationSchedule}
            loanSummary={loanSummary}
            isCalculating={isCalculating}
            errors={errors}
            onUpdateLoanDetails={updateLoanDetails}
          />
        </TabsContent>

        <TabsContent value="tracker">
          <PaymentTracker
            amortizationSchedule={amortizationSchedule}
            selectedPayments={selectedPayments}
            onUpdatePayment={updatePayment}
            onToggleLock={toggleLock}
            onToggleSelection={togglePaymentSelection}
            onBulkUpdate={bulkUpdatePaymentStatus}
            onClearSelection={clearSelection}
          />
        </TabsContent>

        <TabsContent value="schedule">
          <PaymentSchedule
            amortizationSchedule={amortizationSchedule}
            loanDetails={loanDetails}
          />
        </TabsContent>

        <TabsContent value="details">
          <LoanDetails
            loanDetails={loanDetails}
            loanSummary={loanSummary}
            onUpdateLoanDetails={updateLoanDetails}
          />
        </TabsContent>

        <TabsContent value="export">
          <ExportOptions
            loanDetails={loanDetails}
            amortizationSchedule={amortizationSchedule}
            loanSummary={loanSummary}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}