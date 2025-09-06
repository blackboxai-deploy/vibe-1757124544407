'use client';

import { LoanDetails, AmortizationSchedule, LoanSummary } from '@/types/loan';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useState } from 'react';
import { formatCurrency } from '@/lib/loanCalculations';
import { format } from 'date-fns';

interface ExportOptionsProps {
  loanDetails: LoanDetails;
  amortizationSchedule: AmortizationSchedule | null;
  loanSummary: LoanSummary | null;
}

export function ExportOptions({
  loanDetails,
  amortizationSchedule,
  loanSummary,
}: ExportOptionsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  const generateCSV = () => {
    if (!amortizationSchedule) return;

    const headers = [
      'Payment Number',
      'Due Date',
      'Monthly Payment',
      'Principal Amount',
      'Interest Amount',
      'Remaining Balance',
      'Status',
      'Paid Date',
      'Notes'
    ];

    const csvContent = [
      headers.join(','),
      ...amortizationSchedule.payments.map(payment => [
        payment.paymentNumber,
        format(payment.dueDate, 'yyyy-MM-dd'),
        payment.totalPayment,
        payment.principalAmount,
        payment.interestAmount,
        payment.remainingBalance,
        payment.isPaid ? 'Paid' : 'Unpaid',
        payment.paidDate ? format(payment.paidDate, 'yyyy-MM-dd') : '',
        payment.notes || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `loan-schedule-${loanDetails.description || 'untitled'}-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateJSON = () => {
    const exportData = {
      loanDetails,
      amortizationSchedule,
      loanSummary,
      exportDate: new Date().toISOString(),
      exportVersion: '1.0'
    };

    const jsonContent = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `loan-data-${loanDetails.description || 'untitled'}-${format(new Date(), 'yyyy-MM-dd')}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generatePrintReport = () => {
    if (!amortizationSchedule || !loanSummary) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Loan Payment Schedule - ${loanDetails.description || 'Untitled'}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .summary { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .summary-card { border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
            .summary-card h3 { margin-top: 0; color: #666; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .text-right { text-align: right; }
            .paid { background-color: #f0f9ff; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
            @media print {
              body { margin: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Loan Payment Schedule</h1>
            <h2>${loanDetails.description || 'Untitled Loan'}</h2>
            <p>Generated on ${format(new Date(), 'MMMM dd, yyyy')}</p>
          </div>
          
          <div class="summary">
            <div class="summary-card">
              <h3>Loan Details</h3>
              <p><strong>Principal:</strong> ${formatCurrency(loanDetails.principal)}</p>
              <p><strong>Interest Rate:</strong> ${loanDetails.interestRate}%</p>
              <p><strong>Term:</strong> ${Math.floor(loanDetails.termMonths / 12)} years ${loanDetails.termMonths % 12} months</p>
              <p><strong>Start Date:</strong> ${format(loanDetails.startDate, 'MMMM dd, yyyy')}</p>
              <p><strong>Lender:</strong> ${loanDetails.loanSource || 'Not specified'}</p>
            </div>
            
            <div class="summary-card">
              <h3>Payment Summary</h3>
              <p><strong>Monthly Payment:</strong> ${formatCurrency(loanSummary.monthlyPayment)}</p>
              <p><strong>Total Interest:</strong> ${formatCurrency(loanSummary.totalInterest)}</p>
              <p><strong>Total Amount:</strong> ${formatCurrency(loanSummary.totalAmount)}</p>
              <p><strong>Progress:</strong> ${loanSummary.paidPayments} of ${loanSummary.totalPayments} payments (${loanSummary.progressPercentage.toFixed(1)}%)</p>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Due Date</th>
                <th class="text-right">Payment</th>
                <th class="text-right">Principal</th>
                <th class="text-right">Interest</th>
                <th class="text-right">Balance</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${amortizationSchedule.payments.map(payment => `
                <tr class="${payment.isPaid ? 'paid' : ''}">
                  <td>${payment.paymentNumber}</td>
                  <td>${format(payment.dueDate, 'MMM dd, yyyy')}</td>
                  <td class="text-right">${formatCurrency(payment.totalPayment)}</td>
                  <td class="text-right">${formatCurrency(payment.principalAmount)}</td>
                  <td class="text-right">${formatCurrency(payment.interestAmount)}</td>
                  <td class="text-right">${formatCurrency(payment.remainingBalance)}</td>
                  <td>${payment.isPaid ? 'Paid' : 'Due'}${payment.isLocked ? ' (Locked)' : ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>Generated by Loan Calculator Pro | ${format(new Date(), 'MMMM dd, yyyy \'at\' HH:mm')}</p>
          </div>
          
          <div class="no-print" style="text-align: center; margin-top: 30px;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
              Print This Report
            </button>
            <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
              Close
            </button>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const handleExport = async (type: 'csv' | 'json' | 'print') => {
    setIsExporting(true);
    setExportStatus(null);

    try {
      switch (type) {
        case 'csv':
          generateCSV();
          setExportStatus('CSV file downloaded successfully');
          break;
        case 'json':
          generateJSON();
          setExportStatus('JSON file downloaded successfully');
          break;
        case 'print':
          generatePrintReport();
          setExportStatus('Print report opened in new window');
          break;
      }
    } catch (error) {
      setExportStatus('Export failed. Please try again.');
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportStatus(null), 3000);
    }
  };

  const hasData = amortizationSchedule && loanSummary;

  return (
    <div className="space-y-6">
      {/* Export Status */}
      {exportStatus && (
        <Alert>
          <AlertDescription>{exportStatus}</AlertDescription>
        </Alert>
      )}

      {/* Export Options */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* CSV Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📊 CSV Export
              <Badge variant="secondary">Spreadsheet</Badge>
            </CardTitle>
            <CardDescription>
              Download payment schedule as CSV for Excel/Sheets analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Payment schedule with all calculations</li>
                <li>• Payment status and dates</li>
                <li>• Import into Excel or Google Sheets</li>
                <li>• Perfect for financial analysis</li>
              </ul>
              
              <Button 
                onClick={() => handleExport('csv')}
                disabled={!hasData || isExporting}
                className="w-full"
              >
                {isExporting ? 'Exporting...' : 'Download CSV'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* JSON Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              💾 JSON Backup
              <Badge variant="secondary">Data</Badge>
            </CardTitle>
            <CardDescription>
              Complete loan data backup for import/restore
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Complete loan configuration</li>
                <li>• All payment data and status</li>
                <li>• Backup for data recovery</li>
                <li>• Import into other systems</li>
              </ul>
              
              <Button 
                onClick={() => handleExport('json')}
                disabled={!hasData || isExporting}
                className="w-full"
                variant="outline"
              >
                {isExporting ? 'Exporting...' : 'Download JSON'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Print Report */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🖨️ Print Report
              <Badge variant="secondary">PDF</Badge>
            </CardTitle>
            <CardDescription>
              Professional formatted report for printing or PDF saving
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Professional loan schedule</li>
                <li>• Summary and detailed breakdown</li>
                <li>• Print-optimized layout</li>
                <li>• Save as PDF from browser</li>
              </ul>
              
              <Button 
                onClick={() => handleExport('print')}
                disabled={!hasData || isExporting}
                className="w-full"
                variant="destructive"
              >
                {isExporting ? 'Generating...' : 'Generate Report'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Summary */}
      {hasData && (
        <Card>
          <CardHeader>
            <CardTitle>Export Data Summary</CardTitle>
            <CardDescription>
              Overview of data available for export
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {amortizationSchedule.payments.length}
                </div>
                <div className="text-sm text-gray-600">Total Payments</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {loanSummary.paidPayments}
                </div>
                <div className="text-sm text-gray-600">Paid Payments</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {amortizationSchedule.payments.filter(p => p.isLocked).length}
                </div>
                <div className="text-sm text-gray-600">Locked Payments</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {loanSummary.progressPercentage.toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600">Completion</div>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Loan Description:</strong> {loanDetails.description || 'Untitled'}</p>
              <p><strong>Principal Amount:</strong> {formatCurrency(loanDetails.principal)}</p>
              <p><strong>Interest Rate:</strong> {loanDetails.interestRate}% APR</p>
              <p><strong>Monthly Payment:</strong> {formatCurrency(loanSummary.monthlyPayment)}</p>
              <p><strong>Last Updated:</strong> {format(loanDetails.updatedAt, 'MMMM dd, yyyy \'at\' HH:mm')}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {!hasData && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <div className="text-lg font-medium mb-2">No Data Available</div>
              <div className="text-sm">
                Configure loan parameters in the Calculator tab to enable export options
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}