'use client';

import { LoanDetails, AmortizationSchedule, LoanSummary } from '@/types/loan';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/loanCalculations';

interface LoanCalculatorProps {
  loanDetails: LoanDetails;
  amortizationSchedule: AmortizationSchedule | null;
  loanSummary: LoanSummary | null;
  isCalculating: boolean;
  errors: Record<string, string>;
  onUpdateLoanDetails: (updates: Partial<LoanDetails>) => void;
}

export function LoanCalculator({
  loanDetails,
  amortizationSchedule,
  loanSummary,
  isCalculating,
  errors,
  onUpdateLoanDetails,
}: LoanCalculatorProps) {
  const handleInputChange = (field: keyof LoanDetails) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    
    if (field === 'principal' || field === 'termMonths') {
      const numValue = parseFloat(value) || 0;
      onUpdateLoanDetails({ [field]: numValue });
    } else if (field === 'interestRate') {
      const numValue = parseFloat(value) || 0;
      onUpdateLoanDetails({ [field]: numValue });
    } else if (field === 'startDate') {
      onUpdateLoanDetails({ [field]: new Date(value) });
    }
  };

  const handleQuickAmount = (amount: number) => {
    onUpdateLoanDetails({ principal: amount });
  };

  const handleQuickTerm = (months: number) => {
    onUpdateLoanDetails({ termMonths: months });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Loan Parameters</CardTitle>
          <CardDescription>
            Enter your loan details to calculate payments and schedule
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Principal Amount */}
          <div className="space-y-2">
            <Label htmlFor="principal">Loan Amount (Principal)</Label>
            <Input
              id="principal"
              type="number"
              value={loanDetails.principal}
              onChange={handleInputChange('principal')}
              placeholder="100000"
              min="1"
              step="1000"
              className={errors.principal ? 'border-red-500' : ''}
            />
            {errors.principal && (
              <p className="text-sm text-red-600">{errors.principal}</p>
            )}
            
            {/* Quick Amount Buttons */}
            <div className="flex flex-wrap gap-2 mt-2">
              {[50000, 100000, 250000, 500000, 750000, 1000000].map(amount => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAmount(amount)}
                  className="text-xs"
                >
                  {formatCurrency(amount, 'USD').replace('.00', '')}
                </Button>
              ))}
            </div>
          </div>

          {/* Interest Rate */}
          <div className="space-y-2">
            <Label htmlFor="interestRate">Annual Interest Rate (%)</Label>
            <Input
              id="interestRate"
              type="number"
              value={loanDetails.interestRate}
              onChange={handleInputChange('interestRate')}
              placeholder="5.5"
              min="0"
              max="30"
              step="0.1"
              className={errors.interestRate ? 'border-red-500' : ''}
            />
            {errors.interestRate && (
              <p className="text-sm text-red-600">{errors.interestRate}</p>
            )}
          </div>

          {/* Loan Term */}
          <div className="space-y-2">
            <Label htmlFor="termMonths">Loan Term (Months)</Label>
            <Input
              id="termMonths"
              type="number"
              value={loanDetails.termMonths}
              onChange={handleInputChange('termMonths')}
              placeholder="360"
              min="1"
              max="480"
              step="1"
              className={errors.termMonths ? 'border-red-500' : ''}
            />
            {errors.termMonths && (
              <p className="text-sm text-red-600">{errors.termMonths}</p>
            )}
            
            {/* Quick Term Buttons */}
            <div className="flex flex-wrap gap-2 mt-2">
              {[
                { months: 180, label: '15 years' },
                { months: 240, label: '20 years' },
                { months: 360, label: '30 years' },
                { months: 420, label: '35 years' },
              ].map(term => (
                <Button
                  key={term.months}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickTerm(term.months)}
                  className="text-xs"
                >
                  {term.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label htmlFor="startDate">Loan Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={loanDetails.startDate.toISOString().split('T')[0]}
              onChange={handleInputChange('startDate')}
            />
          </div>

          {/* General Errors */}
          {errors.general && (
            <Alert variant="destructive">
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      <Card>
        <CardHeader>
          <CardTitle>Calculation Results</CardTitle>
          <CardDescription>
            Auto-calculated loan summary and key metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isCalculating ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : loanSummary && amortizationSchedule ? (
            <div className="space-y-4">
              {/* Monthly Payment */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="text-sm font-medium text-blue-700 mb-1">Monthly Payment</div>
                <div className="text-3xl font-bold text-blue-900">
                  {formatCurrency(loanSummary.monthlyPayment)}
                </div>
                <div className="text-sm text-blue-600 mt-1">
                  Principal & Interest only
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs font-medium text-gray-600 mb-1">Total Interest</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatCurrency(loanSummary.totalInterest)}
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs font-medium text-gray-600 mb-1">Total Amount</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatCurrency(loanSummary.totalAmount)}
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs font-medium text-gray-600 mb-1">Interest Rate</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {loanDetails.interestRate.toFixed(3)}%
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs font-medium text-gray-600 mb-1">Loan Term</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {Math.floor(loanDetails.termMonths / 12)}yr {loanDetails.termMonths % 12}mo
                  </div>
                </div>
              </div>

              {/* Interest vs Principal Breakdown */}
              <div className="bg-gradient-to-r from-orange-50 to-blue-50 p-4 rounded-lg border">
                <div className="text-sm font-medium text-gray-700 mb-3">Cost Breakdown</div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Principal Amount:</span>
                    <span className="font-semibold">{formatCurrency(loanDetails.principal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Interest:</span>
                    <span className="font-semibold text-orange-700">
                      {formatCurrency(loanSummary.totalInterest)}
                    </span>
                  </div>
                  <div className="border-t pt-2 flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Total Cost:</span>
                    <span className="text-lg font-bold">
                      {formatCurrency(loanSummary.totalAmount)}
                    </span>
                  </div>
                </div>
                
                {/* Visual ratio bar */}
                <div className="mt-3">
                  <div className="flex text-xs text-gray-600 mb-1">
                    <span>Principal</span>
                    <span className="ml-auto">Interest</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-blue-500" 
                      style={{ 
                        width: `${(loanDetails.principal / loanSummary.totalAmount) * 100}%` 
                      }}
                    />
                    <div 
                      className="bg-orange-500" 
                      style={{ 
                        width: `${(loanSummary.totalInterest / loanSummary.totalAmount) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <div className="text-sm">Enter loan parameters to see calculations</div>
              <div className="text-xs mt-1 text-gray-400">
                Results will appear automatically as you type
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}