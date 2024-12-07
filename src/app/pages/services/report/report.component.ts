import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { NgApexchartsModule } from 'ng-apexcharts';
import { format, parseISO, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { PaymentHistory, PaymentHistoryService } from "../../../services/report.service";

import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexStroke,
  ApexTooltip,
  ApexFill,
  ApexDataLabels,
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexLegend
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  tooltip: ApexTooltip;
  dataLabels: ApexDataLabels;
  fill: ApexFill;
};

export type PieChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  colors: string[];
  legend: ApexLegend;
  responsive: ApexResponsive[];
};

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    NgApexchartsModule
  ],
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {
  @ViewChild("chart") chart!: ChartComponent;

  loading = true;
  payments: PaymentHistory[] = [];

  revenueData = {
    total: 0,
    percentage: 0,
    trend: 'up' as 'up' | 'down',
    lastMonth: 0,
    currentMonth: 0,
    yearToDate: 0
  };

  paymentStats = {
    totalCount: 0,
    averageAmount: 0,
    maxAmount: 0,
    minAmount: 0
  };

  chartOptions: ChartOptions = {
    series: [{
      name: 'Ingresos Mensuales',
      data: []
    }],
    chart: {
      height: 350,
      type: 'area',
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    xaxis: {
      type: 'category',
      categories: [],
      labels: {
        formatter: function(value) {
          return value;
        }
      }
    },
    tooltip: {
      x: {
        format: 'dd MMM yyyy'
      },
      y: {
        formatter: (value: number) => {
          return `S/ ${new Intl.NumberFormat('es-PE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }).format(value)}`;
        }
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 90, 100]
      }
    }
  };

  pieChartOptions: PieChartOptions = {
    series: [],
    chart: {
      type: 'donut',
      height: 300
    },
    labels: ['< S/1000', 'S/1000-S/5000', 'S/5000-S/10000', '> S/10000'],
    colors: ['#00E396', '#FEB019', '#FF4560', '#008FFB'],
    legend: {
      position: 'bottom',
      formatter: function(seriesName, opts) {
        return `${seriesName}: ${opts.w.globals.series[opts.seriesIndex]}`;
      }
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom'
        }
      }
    }],
  };

  constructor(private paymentHistoryService: PaymentHistoryService) {}

  ngOnInit() {
    this.loadData();
  }

  private loadData() {
    this.loading = true;
    this.paymentHistoryService.getAllPaymentHistory().subscribe({
      next: (payments) => {
        this.payments = payments;
        this.calculateAllStatistics();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando historial de pagos:', error);
        this.loading = false;
      }
    });
  }

  private calculateAllStatistics() {
    this.calculateRevenueStatistics();
    this.calculatePaymentStats();
    this.updateCharts();
  }

  private calculateRevenueStatistics() {
    const now = new Date();
    const currentMonth = startOfMonth(now);
    const lastMonth = startOfMonth(subMonths(now, 1));
    const yearStart = new Date(now.getFullYear(), 0, 1);

    // Filtrar pagos por período
    const currentMonthPayments = this.payments.filter(p =>
      new Date(p.paymentDate) >= currentMonth);
    const lastMonthPayments = this.payments.filter(p =>
      new Date(p.paymentDate) >= lastMonth && new Date(p.paymentDate) < currentMonth);
    const yearToDatePayments = this.payments.filter(p =>
      new Date(p.paymentDate) >= yearStart);

    // Calcular totales
    const currentTotal = this.sumPayments(currentMonthPayments);
    const lastTotal = this.sumPayments(lastMonthPayments);
    const yearTotal = this.sumPayments(yearToDatePayments);

    // Calcular cambio porcentual
    const percentageChange = lastTotal ? ((currentTotal - lastTotal) / lastTotal) * 100 : 0;

    this.revenueData = {
      total: yearTotal,
      currentMonth: currentTotal,
      lastMonth: lastTotal,
      percentage: percentageChange,
      trend: currentTotal >= lastTotal ? 'up' : 'down',
      yearToDate: yearTotal
    };
  }

  private calculatePaymentStats() {
    if (this.payments.length === 0) {
      this.paymentStats = {
        totalCount: 0,
        averageAmount: 0,
        maxAmount: 0,
        minAmount: 0
      };
      return;
    }

    const amounts = this.payments.map(p => p.amount);
    this.paymentStats = {
      totalCount: this.payments.length,
      averageAmount: amounts.reduce((a, b) => a + b, 0) / amounts.length,
      maxAmount: Math.max(...amounts),
      minAmount: Math.min(...amounts)
    };
  }

  private updateCharts() {
    this.updateAreaChart();
    this.updatePieChart();
  }

  private updateAreaChart() {
    // Agrupar pagos por mes
    const monthlyData = new Map<string, number>();
    const last6Months = Array.from({length: 6}, (_, i) =>
      format(subMonths(new Date(), i), 'MMM yyyy')
    ).reverse();

    // Inicializar todos los meses con 0
    last6Months.forEach(month => monthlyData.set(month, 0));

    // Sumar pagos por mes
    this.payments.forEach(payment => {
      const monthKey = format(new Date(payment.paymentDate), 'MMM yyyy');
      if (monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + payment.amount);
      }
    });

    // Actualizar datos del gráfico
    this.chartOptions.xaxis.categories = Array.from(monthlyData.keys());
    this.chartOptions.series = [{
      name: 'Ingresos Mensuales',
      data: Array.from(monthlyData.values())
    }];
  }

  private updatePieChart() {
    const ranges = {
      small: 0,    // < S/1000
      medium: 0,   // S/1000-S/5000
      large: 0,    // S/5000-S/10000
      xlarge: 0    // > S/10000
    };

    this.payments.forEach(payment => {
      if (payment.amount < 1000) ranges.small++;
      else if (payment.amount < 5000) ranges.medium++;
      else if (payment.amount < 10000) ranges.large++;
      else ranges.xlarge++;
    });

    this.pieChartOptions.series = [
      ranges.small,
      ranges.medium,
      ranges.large,
      ranges.xlarge
    ];
  }

  private sumPayments(payments: PaymentHistory[]): number {
    return payments.reduce((sum, payment) => sum + payment.amount, 0);
  }

  formatLargeNumber(value: number): string {
    // Primero redondeamos a 2 decimales
    const roundedValue = Number(value.toFixed(2));

    if (roundedValue >= 1_000_000_000_000) { // Trillones
      return `${(roundedValue / 1_000_000_000_000).toFixed(2)}T`;
    } else if (roundedValue >= 1_000_000_000) { // Billones
      return `${(roundedValue / 1_000_000_000).toFixed(2)}B`;
    } else if (roundedValue >= 1_000_000) { // Millones
      return `${(roundedValue / 1_000_000).toFixed(2)}M`;
    } else if (roundedValue >= 1_000) { // Miles
      return `${(roundedValue / 1_000).toFixed(2)}K`;
    }
    // Para números menores a 1000, mostrar con 2 decimales
    return roundedValue.toFixed(2);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  formatPercentage(value: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100);
  }

  formatDate(date: string): string {
    return format(parseISO(date), 'dd/MM/yyyy');
  }

  getCurrentYear(): number {
    return new Date().getFullYear();
  }
}
