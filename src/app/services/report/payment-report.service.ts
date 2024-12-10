import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PaymentHistory, PaymentHistoryService } from "../report.service";
import { saveAs } from 'file-saver';
import { Workbook } from 'exceljs'; // Cambia esta línea

export interface PaymentAggregation {
  period: string;
  totalAmount: number;
  count: number;
  averageAmount: number;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentReportService {
  constructor(private paymentHistoryService: PaymentHistoryService) {}

  getAggregatedData(groupBy: 'hour' | 'day' | 'week' | 'month' | 'year'): Observable<PaymentAggregation[]> {
    return this.paymentHistoryService.getAllPaymentHistory().pipe(
      map(payments => this.aggregatePayments(payments, groupBy))
    );
  }

  async generateExcelReport(data: PaymentAggregation[], reportName: string = 'payment-report'): Promise<void> {
    const workbook = new Workbook(); // Cambia esta línea
    const worksheet = workbook.addWorksheet('Payments');

    // El resto del código permanece igual...
    worksheet.columns = [
      { header: 'Período', key: 'period', width: 20 },
      { header: 'Monto Total', key: 'totalAmount', width: 15 },
      { header: 'Cantidad', key: 'count', width: 12 },
      { header: 'Promedio', key: 'averageAmount', width: 15 }
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    data.forEach(row => {
      worksheet.addRow({
        period: row.period,
        totalAmount: row.totalAmount,
        count: row.count,
        averageAmount: row.averageAmount
      });
    });

    worksheet.getColumn('totalAmount').numFmt = '"S/"#,##0.00';
    worksheet.getColumn('averageAmount').numFmt = '"S/"#,##0.00';

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    saveAs(blob, `${reportName}-${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  private aggregatePayments(payments: PaymentHistory[], groupBy: 'hour' | 'day' | 'week' | 'month' | 'year'): PaymentAggregation[] {
    const aggregated = new Map<string, PaymentAggregation>();

    payments.forEach(payment => {
      const date = new Date(payment.paymentDate);
      let period: string;

      switch (groupBy) {
        case 'hour':
          period = `${date.toISOString().split('T')[0]} ${date.getHours().toString().padStart(2, '0')}:00`;
          break;
        case 'day':
          period = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekNumber = this.getWeekNumber(date);
          period = `${date.getFullYear()}-W${weekNumber}`;
          break;
        case 'month':
          period = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
          break;
        case 'year':
          period = date.getFullYear().toString();
          break;
      }

      if (!aggregated.has(period)) {
        aggregated.set(period, {
          period,
          totalAmount: 0,
          count: 0,
          averageAmount: 0
        });
      }

      const current = aggregated.get(period)!;
      current.totalAmount += payment.amount;
      current.count += 1;
      current.averageAmount = current.totalAmount / current.count;
    });

    return Array.from(aggregated.values()).sort((a, b) => a.period.localeCompare(b.period));
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return weekNo;
  }
}
