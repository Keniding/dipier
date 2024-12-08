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
          callbacks: {
            label: (context) => `S/ ${context.parsed.y.toFixed(2)}`
          },
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

    // Normalizar la fecha actual al inicio del día
    now.setHours(0, 0, 0, 0);

    switch (filters.dateRange) {
      case 'day':
        startDate = new Date(now);
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate = new Date(0);
    }

    // Normalizar startDate al inicio del día
    startDate.setHours(0, 0, 0, 0);

    const filteredPayments = payments.filter(payment =>
      new Date(payment.paymentDate) >= startDate
    );

    const dateMap = new Map<string, Date>();
    this.initializeEmptyPeriods(groupedData, startDate, now, filters.groupBy, dateMap);

    filteredPayments.forEach(payment => {
      const date = new Date(payment.paymentDate);
      const key = this.getGroupKey(date, filters.groupBy);
      groupedData.set(key, (groupedData.get(key) || 0) + payment.amount);
    });

    // Ordenar usando las fechas originales
    return new Map([...groupedData.entries()].sort((a, b) => {
      const dateA = dateMap.get(a[0]) || new Date(0);
      const dateB = dateMap.get(b[0]) || new Date(0);
      return dateA.getTime() - dateB.getTime();
    }));
  }

  private initializeEmptyPeriods(
    groupedData: Map<string, number>,
    startDate: Date,
    endDate: Date,
    groupBy: string,
    dateMap: Map<string, Date>
  ): void {
    const current = new Date(startDate);

    while (current <= endDate) {
      const key = this.getGroupKey(current, groupBy);
      if (!groupedData.has(key)) {
        groupedData.set(key, 0);
        dateMap.set(key, new Date(current)); // Guardar la fecha original para ordenamiento
      }

      const nextDate = new Date(current);
      switch (groupBy) {
        case 'hour':
          nextDate.setHours(current.getHours() + 1);
          break;
        case 'day':
          nextDate.setDate(current.getDate() + 1);
          break;
        case 'week':
          nextDate.setDate(current.getDate() + 7);
          break;
        case 'month':
          nextDate.setMonth(current.getMonth() + 1);
          break;
      }
      current.setTime(nextDate.getTime());
    }
  }

  private getGroupKey(date: Date, groupBy: string): string {
    // Asegurarnos de trabajar con una copia de la fecha
    const workingDate = new Date(date);

    const formatDateRange = (start: Date, end: Date): string => {
      const formatDay = (d: Date) => {
        const day = d.getDate().toString().padStart(2, '0');
        const month = new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(d);
        return `${day} ${month}`;
      };

      const weekNumber = this.getWeekNumber(start);
      return `Sem ${weekNumber}: ${formatDay(start)}-${formatDay(end)}`;
    };

    switch (groupBy) {
      case 'hour': {
        const formatter = new Intl.DateTimeFormat('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: 'short'
        });
        return formatter.format(workingDate);
      }

      case 'day': {
        const formatter = new Intl.DateTimeFormat('es-ES', {
          day: '2-digit',
          month: 'short'
        });
        return formatter.format(workingDate);
      }

      case 'week': {
        const weekStart = new Date(workingDate);
        const weekEnd = new Date(workingDate);
        weekEnd.setDate(weekEnd.getDate() + 6);
        return formatDateRange(weekStart, weekEnd);
      }

      case 'month': {
        const formatter = new Intl.DateTimeFormat('es-ES', {
          month: 'long',
          year: 'numeric'
        });
        return formatter.format(workingDate).replace(' de ', ' ');
      }

      default: {
        const formatter = new Intl.DateTimeFormat('es-ES', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
        return formatter.format(workingDate);
      }
    }
  }

  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }
}
