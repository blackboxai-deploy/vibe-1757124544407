'use client';

import { AmortizationSchedule, LoanDetails } from '@/types/loan';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { formatCurrency } from '@/lib/loanCalculations';
import { format } from 'date-fns';

interface PaymentScheduleProps {
  amortizationSchedule: AmortizationSchedule | null;
  loanDetails: LoanDetails;
}

export function PaymentSchedule({ 
  amortizationSchedule, 
  loanDetails 
}: PaymentScheduleProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [searchTerm, setSearchTerm] = useState('');

  if (!amortizationSchedule) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Schedule</CardTitle>
          <CardDescription>
            Detailed amortization schedule showing principal and interest breakdown
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            <div className="text-sm">No loan data available</div>
            <div className="text-xs mt-1 text-gray-400">
              Configure loan parameters in the Calculator tab first
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredPayments = amortizationSchedule.payments.filter(payment => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      payment.paymentNumber.toString().includes(searchLower) ||
      format(payment.dueDate, 'MMM yyyy').toLowerCase().includes(searchLower) ||
      payment.totalPayment.toString().includes(searchLower)
    );
  });

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPayments = filteredPayments.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Amortization Schedule</CardTitle>
          <CardDescription>
            Complete payment breakdown for {loanDetails.description || 'your loan'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Loan Summary */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-3">Loan Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Principal:</span>
                  <span className="font-medium text-blue-900">{formatCurrency(loanDetails.principal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Interest Rate:</span>
                  <span className="font-medium text-blue-900">{loanDetails.interestRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Term:</span>
                  <span className="font-medium text-blue-900">
                    {Math.floor(loanDetails.termMonths / 12)}y {loanDetails.termMonths % 12}m
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Start Date:</span>
                  <span className="font-medium text-blue-900">
                    {format(loanDetails.startDate, 'MMM dd, yyyy')}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-3">Payment Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700">Monthly Payment:</span>
                  <span className="font-medium text-green-900">
                    {formatCurrency(amortizationSchedule.monthlyPayment)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Total Payments:</span>
                  <span className="font-medium text-green-900">{amortizationSchedule.payments.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Paid:</span>
                  <span className="font-medium text-green-900">
                    {amortizationSchedule.payments.filter(p => p.isPaid).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Remaining:</span>
                  <span className="font-medium text-green-900">
                    {amortizationSchedule.payments.filter(p => !p.isPaid).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Cost Summary */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
              <h3 className="font-semibold text-orange-900 mb-3">Cost Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-orange-700">Total Interest:</span>
                  <span className="font-medium text-orange-900">
                    {formatCurrency(amortizationSchedule.totalInterest)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-orange-700">Total Cost:</span>
                  <span className="font-medium text-orange-900">
                    {formatCurrency(amortizationSchedule.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-orange-700">Cost Ratio:</span>
                  <span className="font-medium text-orange-900">
                    {((amortizationSchedule.totalInterest / loanDetails.principal) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <Label htmlFor="search">Search Payments</Label>
              <Input
                id="search"
                placeholder="Search by payment number, date, or amount..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="max-w-sm"
              />
            </div>
            
            <div>
              <Label htmlFor="items-per-page">Per Page</Label>
              <select
                id="items-per-page"
                value={itemsPerPage}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={36}>36</option>
                <option value={60}>60</option>
                <option value={filteredPayments.length}>All</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Schedule Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Payment</TableHead>
                  <TableHead className="text-right">Principal</TableHead>
                  <TableHead className="text-right">Interest</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="w-20">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentPayments.map((payment, index) => {
                  const isEvenRow = (startIndex + index) % 2 === 0;
                  return (
                    <TableRow 
                      key={payment.paymentNumber}
                      className={`${isEvenRow ? 'bg-gray-50/50' : ''} ${
                        payment.isPaid ? 'bg-green-50' : ''
                      } hover:bg-blue-50 transition-colors`}
                    >
                      <TableCell className="font-medium">
                        {payment.paymentNumber}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {format(payment.dueDate, 'MMM dd, yyyy')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {format(payment.dueDate, 'EEEE')}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(payment.totalPayment)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-medium text-blue-700">
                          {formatCurrency(payment.principalAmount)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-medium text-orange-700">
                          {formatCurrency(payment.interestAmount)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(payment.remainingBalance)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge 
                            variant={payment.isPaid ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {payment.isPaid ? 'Paid' : 'Due'}
                          </Badge>
                          {payment.isLocked && (
                            <Badge variant="outline" className="text-xs">
                              🔒 Locked
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredPayments.length)} of{' '}
                {filteredPayments.length} payments
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  Previous
                </Button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = Math.max(1, currentPage - 2) + i;
                    if (page > totalPages) return null;
                    
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}