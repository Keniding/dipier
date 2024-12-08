// payment-chart.component.ts
import {Component, Input, OnChanges, SimpleChanges, ViewChild, OnDestroy, ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import {BaseChartDirective, NgChartsModule} from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import {ChartFilters, PaymentHistory} from "../../../../../../services/report.service";

@Component({
  selector: 'app-payment-chart',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './payment-chart.component.html',
})
export class PaymentChartComponent implements OnChanges, OnDestroy {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  @Input() payments: PaymentHistory[] = [];
  @Input() filters: ChartFilters = {
    dateRange: 'month',
    groupBy: 'day',
    chartType: 'line'
  };

  chartData: ChartConfiguration['data'] = {
    datasets: [],
    labels: []
  };

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      title: {
        display: true,
        text: 'Historial de Pagos'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Monto (S/)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Fecha'
        }
      }
    }
  };

  chartType: ChartType = 'line';

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['payments'] || changes['filters']) && this.payments) {
      setTimeout(() => this.updateChart(), 0);
    }
  }

  ngOnDestroy() {
    if (this.chart?.chart) {
      this.chart.chart.destroy();
    }
  }

  private updateChart(): void {
    if (this.chart?.chart) {
      this.chart.chart.destroy();
    }

    const groupedData = this.groupDataByFilter();
    this.updateChartData(groupedData);
    this.updateChartType();

    if (this.chart) {
      this.chart.render();
    }
  }

  private groupDataByFilter(): Map<string, number> {
    const groupedData = new Map<string, number>();

    this.payments.forEach(payment => {
      const date = new Date(payment.paymentDate);
      let key = '';

      switch (this.filters.groupBy) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekNumber = this.getWeekNumber(date);
          key = `Semana ${weekNumber}`;
          break;
        case 'month':
          key = date.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
          break;
      }

      const currentAmount = groupedData.get(key) || 0;
      groupedData.set(key, currentAmount + payment.amount);
    });

    return groupedData;
  }

  private updateChartData(groupedData: Map<string, number>): void {
    const sortedEntries = Array.from(groupedData.entries())
      .sort((a, b) => a[0].localeCompare(b[0]));

    this.chartData = {
      labels: sortedEntries.map(([label]) => label),
      datasets: [{
        data: sortedEntries.map(([, value]) => value),
        label: 'Monto de Pagos',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }]
    };
  }

  private updateChartType(): void {
    switch (this.filters.chartType) {
      case 'line':
        this.chartType = 'line';
        break;
      case 'bar':
        this.chartType = 'bar';
        break;
      case 'pie':
        this.chartType = 'pie';
        break;
      default:
        this.chartType = 'line';
    }
  }

  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }
}
