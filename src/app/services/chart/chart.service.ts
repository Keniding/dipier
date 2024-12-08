// services/chart.service.ts
import { Injectable } from '@angular/core';
import { ChartConfiguration, ChartType } from 'chart.js';
import { ChartFilters, PaymentHistory } from "../report.service";

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
            drawOnChartArea: true,
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
    const now = new Date();
    let startDate: Date;

    switch (filters.dateRange) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case 'year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        startDate = new Date(0);
    }

    const filteredPayments = payments.filter(payment =>
      new Date(payment.paymentDate) >= startDate
    );

    this.initializeEmptyPeriods(groupedData, startDate, now, filters.groupBy);

    filteredPayments.forEach(payment => {
      const date = new Date(payment.paymentDate);
      const key = this.getGroupKey(date, filters.groupBy);
      groupedData.set(key, (groupedData.get(key) || 0) + payment.amount);
    });

    return new Map([...groupedData.entries()].sort());
  }

  private initializeEmptyPeriods(
    groupedData: Map<string, number>,
    startDate: Date,
    endDate: Date,
    groupBy: string
  ): void {
    const current = new Date(startDate);

    while (current <= endDate) {
      const key = this.getGroupKey(current, groupBy);
      if (!groupedData.has(key)) {
        groupedData.set(key, 0);
      }

      switch (groupBy) {
        case 'hour':
          current.setHours(current.getHours() + 1);
          break;
        case 'day':
          current.setDate(current.getDate() + 1);
          break;
        case 'week':
          current.setDate(current.getDate() + 7);
          break;
        case 'month':
          current.setMonth(current.getMonth() + 1);
          break;
      }
    }
  }

  private getGroupKey(date: Date, groupBy: string): string {
    const formatOptions: Intl.DateTimeFormatOptions = {
      hour: groupBy === 'hour' ? '2-digit' : undefined,
      minute: groupBy === 'hour' ? '2-digit' : undefined,
      day: ['day', 'hour'].includes(groupBy) ? '2-digit' : undefined,
      month: ['day', 'week', 'month', 'hour'].includes(groupBy) ? 'short' : undefined,
      year: 'numeric',
      weekday: groupBy === 'week' ? 'short' : undefined
    };

    let formatted = new Intl.DateTimeFormat('es-ES', formatOptions).format(date);

    switch (groupBy) {
      case 'hour':
        return formatted;
      case 'day':
        return formatted;
      case 'week':
        return `Semana ${this.getWeekNumber(date)} - ${date.getFullYear()}`;
      case 'month':
        return formatted.split(' de ').join(' ');
      default:
        return formatted;
    }
  }

  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }
}
