'use client';

import { useState } from 'react';
import { AmortizationSchedule, PaymentInfo } from '@/types/loan';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/loanCalculations';
import { format } from 'date-fns';

interface PaymentTrackerProps {
  amortizationSchedule: AmortizationSchedule | null;
  selectedPayments: number[];
  onUpdatePayment: (paymentNumber: number, isPaid: boolean, paidDate?: Date, notes?: string) => void;
  onToggleLock: (paymentNumber: number) => void;
  onToggleSelection: (paymentNumber: number) => void;
  onBulkUpdate: (paymentNumbers: number[], isPaid: boolean, paidDate?: Date, notes?: string) => void;
  onClearSelection: () => void;
}

export function PaymentTracker({
  amortizationSchedule,
  selectedPayments,
  onUpdatePayment,
  onToggleLock,
  onToggleSelection,
  onBulkUpdate,
  onClearSelection,
}: PaymentTrackerProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'unpaid' | 'locked'>('all');
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<'paid' | 'unpaid'>('paid');
  const [bulkDate, setBulkDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [bulkNotes, setBulkNotes] = useState('');

  if (!amortizationSchedule) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Tracker</CardTitle>
          <CardDescription>
            Track individual payment status and manage payment locks
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
    if (filterStatus === 'paid') return payment.isPaid;
    if (filterStatus === 'unpaid') return !payment.isPaid;
    if (filterStatus === 'locked') return payment.isLocked;
    return true;
  });

  const paidCount = amortizationSchedule.payments.filter(p => p.isPaid).length;
  const progressPercentage = (paidCount / amortizationSchedule.payments.length) * 100;

  const handlePaymentClick = (payment: PaymentInfo) => {
    if (payment.isLocked) return;
    onUpdatePayment(payment.paymentNumber, !payment.isPaid, new Date());
  };

  const handleBulkUpdate = () => {
    if (selectedPayments.length === 0) return;
    
    onBulkUpdate(
      selectedPayments,
      bulkAction === 'paid',
      bulkAction === 'paid' ? new Date(bulkDate) : undefined,
      bulkNotes || undefined
    );
    
    setBulkDialogOpen(false);
    setBulkNotes('');
  };

  const getPaymentStatusColor = (payment: PaymentInfo) => {
    if (payment.isLocked) {
      return payment.isPaid ? 'bg-green-600 border-green-700' : 'bg-red-600 border-red-700';
    }
    return payment.isPaid ? 'bg-green-500 border-green-600' : 'bg-gray-200 border-gray-300';
  };

  const getPaymentStatusText = (payment: PaymentInfo) => {
    if (payment.isLocked) {
      return payment.isPaid ? 'Locked - Paid' : 'Locked - Unpaid';
    }
    return payment.isPaid ? 'Paid' : 'Unpaid';
  };

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Payment Progress
            <Badge variant="outline">
              {paidCount} of {amortizationSchedule.payments.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={progressPercentage} className="h-3" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-medium text-gray-700">Completed</div>
                <div className="text-lg font-bold text-green-600">{paidCount}</div>
              </div>
              <div>
                <div className="font-medium text-gray-700">Remaining</div>
                <div className="text-lg font-bold text-orange-600">
                  {amortizationSchedule.payments.length - paidCount}
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-700">Progress</div>
                <div className="text-lg font-bold text-blue-600">
                  {progressPercentage.toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-700">Locked</div>
                <div className="text-lg font-bold text-purple-600">
                  {amortizationSchedule.payments.filter(p => p.isLocked).length}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Management</CardTitle>
          <CardDescription>
            Click payments to mark paid/unpaid, select multiple for bulk operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
            <div className="flex gap-2">
              <div>
                <Label htmlFor="view-mode">View</Label>
                <Select value={viewMode} onValueChange={(value: 'grid' | 'list') => setViewMode(value)}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid">Grid</SelectItem>
                    <SelectItem value="list">List</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="filter">Filter</Label>
                <Select value={filterStatus} onValueChange={(value: typeof filterStatus) => setFilterStatus(value)}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="locked">Locked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2 ml-auto">
              {selectedPayments.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBulkDialogOpen(true)}
                  >
                    Bulk Update ({selectedPayments.length})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClearSelection}
                  >
                    Clear Selection
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Display */}
      <Card>
        <CardContent className="p-6">
          {viewMode === 'grid' ? (
            <div className="grid gap-2 grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12">
              {filteredPayments.map((payment) => (
                <div
                  key={payment.paymentNumber}
                  className={`
                    relative p-2 rounded-lg border-2 cursor-pointer transition-all hover:scale-105
                    ${getPaymentStatusColor(payment)}
                    ${selectedPayments.includes(payment.paymentNumber) ? 'ring-2 ring-blue-500' : ''}
                    ${payment.isLocked ? 'opacity-80' : ''}
                  `}
                  onClick={() => onToggleSelection(payment.paymentNumber)}
                  onDoubleClick={() => handlePaymentClick(payment)}
                  title={`Payment #${payment.paymentNumber} - ${getPaymentStatusText(payment)}
Due: ${format(payment.dueDate, 'MMM yyyy')}
Amount: ${formatCurrency(payment.totalPayment)}
${payment.paidDate ? `Paid: ${format(payment.paidDate, 'MMM dd, yyyy')}` : ''}`}
                >
                  <div className={`text-xs font-semibold text-center ${
                    payment.isPaid ? 'text-white' : 'text-gray-700'
                  }`}>
                    {payment.paymentNumber}
                  </div>
                  
                  {/* Selection checkbox */}
                  <div className="absolute -top-1 -right-1">
                    <Checkbox
                      checked={selectedPayments.includes(payment.paymentNumber)}
                      onCheckedChange={() => onToggleSelection(payment.paymentNumber)}
                      className="h-3 w-3"
                    />
                  </div>
                  
                  {/* Lock indicator */}
                  {payment.isLocked && (
                    <div className="absolute -top-1 -left-1 w-2 h-2 bg-yellow-500 rounded-full border border-yellow-600"></div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredPayments.map((payment) => (
                <div
                  key={payment.paymentNumber}
                  className={`
                    flex items-center justify-between p-3 rounded-lg border transition-colors hover:bg-gray-50
                    ${selectedPayments.includes(payment.paymentNumber) ? 'bg-blue-50 border-blue-200' : 'border-gray-200'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedPayments.includes(payment.paymentNumber)}
                      onCheckedChange={() => onToggleSelection(payment.paymentNumber)}
                    />
                    <div>
                      <div className="font-medium">Payment #{payment.paymentNumber}</div>
                      <div className="text-sm text-gray-500">
                        Due: {format(payment.dueDate, 'MMM dd, yyyy')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(payment.totalPayment)}</div>
                      {payment.paidDate && (
                        <div className="text-sm text-gray-500">
                          Paid: {format(payment.paidDate, 'MMM dd, yyyy')}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={payment.isPaid ? 'default' : 'secondary'}>
                        {getPaymentStatusText(payment)}
                      </Badge>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onToggleLock(payment.paymentNumber)}
                        className="h-8 w-8 p-0"
                        title={payment.isLocked ? 'Unlock payment' : 'Lock payment'}
                      >
                        {payment.isLocked ? '🔒' : '🔓'}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant={payment.isPaid ? 'destructive' : 'default'}
                        onClick={() => handlePaymentClick(payment)}
                        disabled={payment.isLocked}
                        className="h-8"
                      >
                        {payment.isPaid ? 'Mark Unpaid' : 'Mark Paid'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Update Dialog */}
      <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Update Payments</DialogTitle>
            <DialogDescription>
              Update {selectedPayments.length} selected payment(s)
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="bulk-action">Action</Label>
              <Select value={bulkAction} onValueChange={(value: 'paid' | 'unpaid') => setBulkAction(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Mark as Paid</SelectItem>
                  <SelectItem value="unpaid">Mark as Unpaid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {bulkAction === 'paid' && (
              <div>
                <Label htmlFor="bulk-date">Payment Date</Label>
                <Input
                  id="bulk-date"
                  type="date"
                  value={bulkDate}
                  onChange={(e) => setBulkDate(e.target.value)}
                />
              </div>
            )}

            <div>
              <Label htmlFor="bulk-notes">Notes (Optional)</Label>
              <Input
                id="bulk-notes"
                value={bulkNotes}
                onChange={(e) => setBulkNotes(e.target.value)}
                placeholder="Add notes for these payments..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkUpdate}>
              Update {selectedPayments.length} Payment(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}