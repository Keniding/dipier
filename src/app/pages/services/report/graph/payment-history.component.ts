import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {PaymentChartComponent} from "./components/payment-chart/payment-chart.component";
import {PaymentTableComponent} from "./components/payment-table/payment-table.component";
import {SummaryCardsComponent} from "./components/summary-cards/summary-cards.component";
import {PaymentFiltersComponent} from "./components/filters/filters.component";
import {LoadingComponent} from "./components/loading/loading.component";
import {ErrorComponent} from "./components/error/error.component";
import {PaymentHeaderComponent} from "./components/header/header.component";
import {ChartFilters, PaymentHistory, PaymentHistoryService, PaymentSummary} from "../../../../services/report.service";
import {ExportExcelComponent} from "./components/export-exel/export-exel.component";

@Component({
  selector: 'app-payment-history',
  standalone: true,
  imports: [
    CommonModule,
    PaymentChartComponent,
    PaymentTableComponent,
    SummaryCardsComponent,
    PaymentFiltersComponent,
    LoadingComponent,
    ErrorComponent,
    PaymentHeaderComponent,
    ExportExcelComponent
  ],
  providers: [PaymentHistoryService],

  templateUrl: 'payment-history.component.html'
})
export class PaymentHistoryComponent implements OnInit {
  filters: ChartFilters = {
    dateRange: 'month',
    groupBy: 'day',
    chartType: 'line'
  };

  summary: PaymentSummary = {
    total: 0,
    average: 0,
    max: 0,
    min: 0
  };

  filteredPayments: PaymentHistory[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  private paymentsData: PaymentHistory[] = [];

  constructor(private paymentService: PaymentHistoryService) {}

  ngOnInit() {
    setTimeout(() => {
      this.loadData();
    }, 0);
  }

  loadData() {
    this.isLoading = true;
    this.errorMessage = '';

    this.paymentService.getAllPaymentHistory().subscribe({
      next: (data) => {
        this.paymentsData = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Error al cargar los datos: ' + err.message;
        this.isLoading = false;
      }
    });
  }

  onFiltersChange(newFilters: ChartFilters) {
    this.filters = newFilters;
    this.applyFilters();
  }

  private applyFilters() {
    // Filtrar por rango de fecha
    const now = new Date();
    let filteredData = [...this.paymentsData];

    switch (this.filters.dateRange) {
      case 'week':
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredData = filteredData.filter(p => new Date(p.paymentDate) >= lastWeek);
        break;
      case 'month':
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        filteredData = filteredData.filter(p => new Date(p.paymentDate) >= lastMonth);
        break;
      case 'year':
        const lastYear = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        filteredData = filteredData.filter(p => new Date(p.paymentDate) >= lastYear);
        break;
    }

    this.filteredPayments = filteredData;
    this.updateSummary(filteredData);
  }

  private updateSummary(data: PaymentHistory[]) {
    const amounts = data.map(p => p.amount);
    this.summary = {
      total: amounts.reduce((a, b) => a + b, 0),
      average: data.length ? amounts.reduce((a, b) => a + b, 0) / data.length : 0,
      max: data.length ? Math.max(...amounts) : 0,
      min: data.length ? Math.min(...amounts) : 0
    };
  }
}
