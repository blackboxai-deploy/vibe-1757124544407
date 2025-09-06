'use client';

import { LoanDetails as LoanDetailsType, LoanSummary } from '@/types/loan';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { formatCurrency } from '@/lib/loanCalculations';
import { format } from 'date-fns';

interface LoanDetailsProps {
  loanDetails: LoanDetailsType;
  loanSummary: LoanSummary | null;
  onUpdateLoanDetails: (updates: Partial<LoanDetailsType>) => void;
}

export function LoanDetails({
  loanDetails,
  loanSummary,
  onUpdateLoanDetails,
}: LoanDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDetails, setEditedDetails] = useState(loanDetails);

  const handleSave = () => {
    onUpdateLoanDetails(editedDetails);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedDetails(loanDetails);
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof LoanDetailsType, value: string) => {
    setEditedDetails(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Loan Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Loan Information
            <Button
              variant={isEditing ? "destructive" : "outline"}
              size="sm"
              onClick={isEditing ? handleCancel : () => setIsEditing(true)}
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          </CardTitle>
          <CardDescription>
            Manage loan description, source, and additional details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="loan-description">Loan Description</Label>
                <Input
                  id="loan-description"
                  value={editedDetails.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="e.g., Home Mortgage, Car Loan, Personal Loan"
                />
              </div>

              <div>
                <Label htmlFor="loan-source">Loan Source/Lender</Label>
                <Input
                  id="loan-source"
                  value={editedDetails.loanSource}
                  onChange={(e) => handleInputChange('loanSource', e.target.value)}
                  placeholder="e.g., Bank of America, Wells Fargo, Credit Union"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} className="flex-1">
                  Save Changes
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Description</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                  {loanDetails.description || (
                    <span className="text-gray-400 italic">No description provided</span>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600">Loan Source/Lender</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                  {loanDetails.loanSource || (
                    <span className="text-gray-400 italic">No lender specified</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Created</Label>
                  <div className="mt-1 text-sm font-medium">
                    {format(loanDetails.createdAt, 'MMM dd, yyyy')}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600">Last Updated</Label>
                  <div className="mt-1 text-sm font-medium">
                    {format(loanDetails.updatedAt, 'MMM dd, yyyy')}
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600">Loan ID</Label>
                <div className="mt-1 text-xs font-mono text-gray-500 bg-gray-50 p-2 rounded">
                  {loanDetails.id}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loan Summary & Dates */}
      <div className="space-y-6">
        {/* Key Dates */}
        <Card>
          <CardHeader>
            <CardTitle>Important Dates</CardTitle>
            <CardDescription>
              Key milestones and timeline for your loan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Start Date</Label>
                <div className="mt-1 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="font-semibold text-blue-900">
                    {format(loanDetails.startDate, 'MMMM dd, yyyy')}
                  </div>
                  <div className="text-xs text-blue-600">
                    {format(loanDetails.startDate, 'EEEE')}
                  </div>
                </div>
              </div>

              {loanSummary && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Completion Date</Label>
                  <div className="mt-1 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="font-semibold text-green-900">
                      {format(loanSummary.completionDate, 'MMMM dd, yyyy')}
                    </div>
                    <div className="text-xs text-green-600">
                      {format(loanSummary.completionDate, 'EEEE')}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {loanSummary && (
              <>
                <Separator />
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-600 mb-2">Loan Duration</div>
                  <Badge variant="outline" className="text-lg py-2 px-4">
                    {Math.floor(loanDetails.termMonths / 12)} years {loanDetails.termMonths % 12} months
                  </Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Financial Summary */}
        {loanSummary && (
          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
              <CardDescription>
                Complete financial breakdown and current status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="text-xs font-medium text-blue-700 mb-1">Principal Amount</div>
                  <div className="text-lg font-bold text-blue-900">
                    {formatCurrency(loanDetails.principal)}
                  </div>
                </div>

                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <div className="text-xs font-medium text-green-700 mb-1">Monthly Payment</div>
                  <div className="text-lg font-bold text-green-900">
                    {formatCurrency(loanSummary.monthlyPayment)}
                  </div>
                </div>

                <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                  <div className="text-xs font-medium text-orange-700 mb-1">Total Interest</div>
                  <div className="text-lg font-bold text-orange-900">
                    {formatCurrency(loanSummary.totalInterest)}
                  </div>
                </div>

                <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <div className="text-xs font-medium text-purple-700 mb-1">Total Cost</div>
                  <div className="text-lg font-bold text-purple-900">
                    {formatCurrency(loanSummary.totalAmount)}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Progress</span>
                  <span className="font-bold text-lg">
                    {loanSummary.progressPercentage.toFixed(1)}%
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Paid Amount</span>
                  <span className="font-semibold text-green-700">
                    {formatCurrency(loanSummary.paidAmount)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Remaining Balance</span>
                  <span className="font-semibold text-orange-700">
                    {formatCurrency(loanSummary.remainingBalance)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Payments Made</span>
                  <span className="font-semibold">
                    {loanSummary.paidPayments} of {loanSummary.totalPayments}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="text-center">
                <div className="text-sm font-medium text-gray-600 mb-2">Interest Rate</div>
                <Badge variant="outline" className="text-xl py-2 px-4 font-bold">
                  {loanDetails.interestRate}% APR
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}