import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { PaymentHistory, PaymentHistoryService } from "../../../../services/report.service";

// Registrar todos los componentes necesarios de Chart.js
Chart.register(...registerables);

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 bg-white rounded-lg shadow-lg">
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Historial de Pagos</h2>
        <p class="text-gray-600">Resumen de transacciones</p>
      </div>

      <!-- Loading state -->
      <div *ngIf="isLoading" class="flex justify-center items-center h-40">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>

      <!-- Error state -->
      <div *ngIf="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {{ error }}
      </div>

      <!-- Content when data is loaded -->
      <div *ngIf="!isLoading && !error" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Gráfico de línea -->
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-lg font-semibold mb-4">Tendencia de Pagos</h3>
          <div class="relative" style="height: 300px;">
            <canvas #lineCanvas></canvas>
          </div>
        </div>

        <!-- Gráfico de barras -->
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-lg font-semibold mb-4">Pagos por Mes</h3>
          <div class="relative" style="height: 300px;">
            <canvas #barCanvas></canvas>
          </div>
        </div>

        <!-- Tabla de resumen -->
        <div class="md:col-span-2 bg-white p-4 rounded-lg shadow">
          <h3 class="text-lg font-semibold mb-4">Últimos Pagos</h3>
          <div class="overflow-x-auto">
            <table class="min-w-full table-auto">
              <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Factura</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let payment of recentPayments">
                <td class="px-6 py-4 whitespace-nowrap">{{payment.invoiceId}}</td>
                <td class="px-6 py-4 whitespace-nowrap">{{payment.amount}}</td>
                <td class="px-6 py-4 whitespace-nowrap">{{payment.paymentDate | date}}</td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ChartComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('lineCanvas') lineCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barCanvas') barCanvas!: ElementRef<HTMLCanvasElement>;

  recentPayments: PaymentHistory[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  private lineChart: Chart | undefined;
  private barChart: Chart | undefined;
  private paymentsData: PaymentHistory[] = [];

  constructor(private paymentService: PaymentHistoryService) {}

  ngOnInit() {
    this.loadData();
  }

  ngAfterViewInit() {
    if (this.paymentsData.length > 0) {
      this.initializeCharts();
    }
  }

  private loadData() {
    this.isLoading = true;
    this.error = null;

    this.paymentService.getAllPaymentHistory().subscribe({
      next: (payments: PaymentHistory[]) => {
        this.paymentsData = payments;
        this.recentPayments = payments.slice(-5);
        this.isLoading = false;

        setTimeout(() => {
          this.initializeCharts();
        }, 0);
      },
      error: (err) => {
        this.error = 'Error al cargar los datos: ' + err.message;
        this.isLoading = false;
      }
    });
  }

  private initializeCharts() {
    setTimeout(() => {
      try {
        if (!this.lineCanvas?.nativeElement || !this.barCanvas?.nativeElement) {
          console.error('Canvas elements not found');
          return;
        }

        if (this.lineChart) {
          this.lineChart.destroy();
        }
        if (this.barChart) {
          this.barChart.destroy();
        }

        const dates = this.paymentsData.map(p => new Date(p.paymentDate).toLocaleDateString());
        const amounts = this.paymentsData.map(p => p.amount);

        const commonOptions = {
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
        };

        // Gráfico de línea
        const lineCtx = this.lineCanvas.nativeElement.getContext('2d');
        if (lineCtx) {
          this.lineChart = new Chart(lineCtx, {
            type: 'line',
            data: {
              labels: dates,
              datasets: [{
                label: 'Monto de Pagos',
                data: amounts,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
                fill: false
              }]
            },
            options: {
              ...commonOptions,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Tendencia de Pagos en el Tiempo'
                }
              }
            }
          });
        }

        // Gráfico de barras
        const barCtx = this.barCanvas.nativeElement.getContext('2d');
        if (barCtx) {
          this.barChart = new Chart(barCtx, {
            type: 'bar',
            data: {
              labels: dates,
              datasets: [{
                label: 'Pagos',
                data: amounts,
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgb(54, 162, 235)',
                borderWidth: 1
              }]
            },
            options: {
              ...commonOptions,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Distribución de Pagos'
                }
              }
            }
          });
        }
      } catch (error) {
        console.error('Error initializing charts:', error);
      }
    }, 0);
  }

  ngOnDestroy() {
    if (this.lineChart) {
      this.lineChart.destroy();
    }
    if (this.barChart) {
      this.barChart.destroy();
    }
  }
}
