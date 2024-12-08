// services/chart.service.ts
import { Injectable } from '@angular/core';
import { ChartConfiguration, ChartType } from 'chart.js';
import {ChartFilters, PaymentHistory} from "../report.service";

@Injectable({
  providedIn: 'root'
})
export class ChartService {
  private readonly CHART_COLORS = {
    primary: {
      main: 'rgb(59, 130, 246)',
      light: 'rgba(59, 130, 246, 0.2)'
    },
    secondary: {
      main: 'rgb(99, 102, 241)',
      light: 'rgba(99, 102, 241, 0.2)'
    }
  };

  getDefaultChartOptions(title: string): ChartConfiguration['options'] {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            padding: 20,
            usePointStyle: true
          }
        },
        title: {
          display: true,
          text: title,
          padding: {
            top: 10,
            bottom: 30
          },
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          titleColor: '#000',
          bodyColor: '#666',
          borderColor: '#ddd',
          borderWidth: 1
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Monto (S/)',
            padding: { top: 20, bottom: 20 }
          },
          grid: {
            display: true,
            drawOnChartArea: true, //
            color: 'rgba(200, 200, 200, 0.2)'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Fecha',
            padding: { top: 20, bottom: 10 }
          },
          grid: {
            display: false
          }
        }
      },
      animation: {
        duration: 750,
        easing: 'easeInOutQuart'
      }
    };
  }

  processChartData(payments: PaymentHistory[], filters: ChartFilters): Map<string, number> {
    const groupedData = new Map<string, number>();

    payments.forEach(payment => {
      const date = new Date(payment.paymentDate);
      const key = this.getGroupKey(date, filters.groupBy);
      groupedData.set(key, (groupedData.get(key) || 0) + payment.amount);
    });

    return new Map([...groupedData.entries()].sort());
  }

  private getGroupKey(date: Date, groupBy: string): string {
    const formatOptions: Intl.DateTimeFormatOptions = {
      hour: groupBy === 'hour' ? '2-digit' : undefined,
      day: ['day', 'week'].includes(groupBy) ? '2-digit' : undefined,
      month: ['day', 'week', 'month'].includes(groupBy) ? 'long' : undefined,
      year: 'numeric',
      weekday: groupBy === 'week' ? 'long' : undefined
    };

    return new Intl.DateTimeFormat('es-ES', formatOptions).format(date);
  }
}
