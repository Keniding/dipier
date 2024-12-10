// components/export-excel/export-excel.component.ts
import { Component, Input } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { PaymentReportService } from "../../../../../../services/report/payment-report.service";

@Component({
  selector: 'app-export-excel',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ],
  template: `
    <div class="flex gap-2">
      <select
        [(ngModel)]="selectedGroupBy"
        class="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
      >
        <option value="hour">Por Hora</option>
        <option value="day">Diario</option>
        <option value="week">Semanal</option>
        <option value="month">Mensual</option>
        <option value="year">Anual</option>
      </select>

      <button
        (click)="exportData()"
        class="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Exportar Excel
      </button>
    </div>
  `
})
export class ExportExcelComponent {
  @Input() payments: any[] = [];
  selectedGroupBy: 'hour' | 'day' | 'week' | 'month' | 'year' = 'day';

  constructor(private reportService: PaymentReportService) {}

  exportData() {
    this.reportService.getAggregatedData(this.selectedGroupBy)
      .subscribe(data => {
        this.reportService.generateExcelReport(
          data,
          `payment-report-${this.selectedGroupBy}`
        );
      });
  }
}
