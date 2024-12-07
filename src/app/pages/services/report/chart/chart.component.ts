import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { PaymentHistory, PaymentHistoryService } from "../../../../services/report.service";

// Registrar Chart.js
Chart.register(...registerables);

interface ChartFilters {
  dateRange: 'week' | 'month' | 'year' | 'all';
  groupBy: 'day' | 'week' | 'month';
  chartType: 'line' | 'bar' | 'pie';
}

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: 'chart.component.html',
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ChartComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mainChart') mainChart!: ElementRef<HTMLCanvasElement>;

  filters: ChartFilters = {
    dateRange: 'month',
    groupBy: 'day',
    chartType: 'line'
  };

  summary = {
    total: 0,
    average: 0,
    max: 0,
    min: 0
  };

  filteredPayments: PaymentHistory[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  private chart: Chart | undefined;
  private paymentsData: PaymentHistory[] = [];

  constructor(private paymentService: PaymentHistoryService) {}

  ngOnInit() {
    this.loadData();
  }

  ngAfterViewInit() {
    if (this.paymentsData.length > 0) {
      this.applyFilters();
    }
  }

  protected loadData() {
    this.isLoading = true;
    this.error = null;

    this.paymentService.getAllPaymentHistory().subscribe({
      next: (payments: PaymentHistory[]) => {
        this.paymentsData = payments;
        this.filteredPayments = payments.slice(-5);
        this.updateSummary(payments);
        this.isLoading = false;

        setTimeout(() => {
          this.applyFilters();
        });
      },
      error: (err) => {
        this.error = 'Error al cargar los datos: ' + err.message;
        this.isLoading = false;
      }
    });
  }

  applyFilters() {
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

    // Agrupar datos
    const groupedData = this.groupData(filteredData);

    // Actualizar datos filtrados y resumen
    this.filteredPayments = filteredData;
    this.updateSummary(filteredData);

    // Actualizar gráfico
    this.updateChart(groupedData);
  }

  private groupData(data: PaymentHistory[]) {
    const grouped = new Map<string, number>();

    // Ordenar los datos por fecha
    const sortedData = [...data].sort((a, b) =>
      new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime()
    );

    sortedData.forEach(payment => {
      const date = new Date(payment.paymentDate);
      let key: string;

      switch (this.filters.groupBy) {
        case 'day':
          key = date.toLocaleDateString();
          break;
        case 'week':
          // Obtener el primer día de la semana (domingo = 0)
          const firstDayOfWeek = new Date(date);
          const day = date.getDay();
          firstDayOfWeek.setDate(date.getDate() - day);

          // Obtener el último día de la semana
          const lastDayOfWeek = new Date(firstDayOfWeek);
          lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);

          // Formato: "DD/MM - DD/MM"
          key = `${firstDayOfWeek.getDate()}/${firstDayOfWeek.getMonth() + 1} - ${lastDayOfWeek.getDate()}/${lastDayOfWeek.getMonth() + 1}`;
          break;
        case 'month':
          key = date.toLocaleString('default', { month: 'long', year: 'numeric' });
          break;
      }

      grouped.set(key, (grouped.get(key) || 0) + payment.amount);
    });

    // Convertir el Map a arrays y mantener el orden
    const entries = Array.from(grouped.entries());

    // Para semanas y meses, mantener el orden cronológico
    if (this.filters.groupBy !== 'day') {
      entries.sort((a, b) => {
        if (this.filters.groupBy === 'week') {
          // Convertir "DD/MM - DD/MM" a fecha para comparar
          const [startA] = a[0].split(' - ')[0].split('/').map(Number);
          const [startB] = b[0].split(' - ')[0].split('/').map(Number);
          return startA - startB;
        }
        return 0; // Para meses, el orden ya está correcto
      });
    }

    return {
      labels: entries.map(([label]) => label),
      data: entries.map(([, value]) => value)
    };
  }

  private updateSummary(data: PaymentHistory[]) {
    const amounts = data.map(p => p.amount);
    this.summary = {
      total: amounts.reduce((a, b) => a + b, 0),
      average: amounts.reduce((a, b) => a + b, 0) / amounts.length,
      max: Math.max(...amounts),
      min: Math.min(...amounts)
    };
  }

  private updateChart(groupedData: { labels: string[], data: number[] }) {
    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = this.mainChart.nativeElement.getContext('2d');
    if (ctx) {
      this.chart = new Chart(ctx, {
        type: this.filters.chartType,
        data: {
          labels: groupedData.labels,
          datasets: [{
            label: 'Monto de Pagos',
            data: groupedData.data,
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgb(54, 162, 235)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value: any) => `$${value}`
              }
            }
          }
        }
      });
    }
  }

  getChartTitle(): string {
    const range = {
      'week': 'Última Semana',
      'month': 'Último Mes',
      'year': 'Último Año',
      'all': 'Todo el Período'
    }[this.filters.dateRange];

    const grouping = {
      'day': 'por Día',
      'week': 'por Semana',
      'month': 'por Mes'
    }[this.filters.groupBy];

    return `Pagos ${range} ${grouping}`;
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
