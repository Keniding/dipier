// components/payment-chart/payment-chart.component.ts
import { Component, Input, OnChanges, SimpleChanges, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective, NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { Subject } from 'rxjs';
import {ChartFilters, PaymentHistory} from "../../../../../../services/report.service";
import {ChartService} from "../../../../../../services/chart/chart.service";

@Component({
  selector: 'app-payment-chart',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: 'payment-chart.component.html'
})
export class PaymentChartComponent implements OnChanges, OnDestroy {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  @Input() payments: PaymentHistory[] = [];
  @Input() filters: ChartFilters = {
    dateRange: 'month',
    groupBy: 'day',
    chartType: 'line'
  };

  loading = false;
  chartData: ChartConfiguration['data'] = {
    datasets: [],
    labels: []
  };
  chartOptions: ChartConfiguration['options'];
  chartType: ChartType = 'line';
  private destroy$ = new Subject<void>();

  constructor(private chartService: ChartService) {
    this.chartOptions = this.chartService.getDefaultChartOptions('Historial de Pagos');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['payments'] || changes['filters']) && this.payments) {
      this.updateChartWithAnimation();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.chart?.chart) {
      this.chart.chart.destroy();
    }
  }

  private async updateChartWithAnimation(): Promise<void> {
    this.loading = true;
    try {
      await this.updateChart();
    } finally {
      this.loading = false;
    }
  }

  private async updateChart(): Promise<void> {
    const groupedData = this.chartService.processChartData(this.payments, this.filters);

    this.chartData = {
      labels: Array.from(groupedData.keys()),
      datasets: [{
        data: Array.from(groupedData.values()),
        label: 'Monto de Pagos',
        backgroundColor: this.getBackgroundColor(),
        borderColor: this.getBorderColor(),
        borderWidth: 2,
        fill: true,
        tension: this.filters.chartType === 'line' ? 0.4 : undefined
      }]
    };

    this.chartType = this.filters.chartType;

    if (this.chart) {
      await this.chart.render();
    }
  }

  private getBackgroundColor(): string | string[] {
    return this.filters.chartType === 'pie' || this.filters.chartType === 'doughnut'
      ? ['#60A5FA', '#34D399', '#F472B6', '#FBBF24', '#A78BFA']
      : 'rgba(59, 130, 246, 0.2)';
  }

  private getBorderColor(): string | string[] {
    return this.filters.chartType === 'pie' || this.filters.chartType === 'doughnut'
      ? ['#2563EB', '#059669', '#DB2777', '#D97706', '#7C3AED']
      : 'rgb(59, 130, 246)';
  }
}
