import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartFilters } from '../../models/payment.models';

@Component({
  selector: 'app-payment-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-xl shadow-lg p-6 m-2">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Filtro de Rango de Fecha -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            <i class="fas fa-calendar-alt mr-2"></i>Rango de Fecha
          </label>
          <select
            [(ngModel)]="filters.dateRange"
            (change)="onFilterChange()"
            class="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 transition duration-150 ease-in-out hover:bg-gray-100">
            <option value="week">Última Semana</option>
            <option value="month">Último Mes</option>
            <option value="year">Último Año</option>
            <option value="all">Todo</option>
          </select>
        </div>

        <!-- Filtro de Agrupación -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            <i class="fas fa-layer-group mr-2"></i>Agrupar Por
          </label>
          <select
            [(ngModel)]="filters.groupBy"
            (change)="onFilterChange()"
            class="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 transition duration-150 ease-in-out hover:bg-gray-100">
            <option value="day">Día</option>
            <option value="week">Semana</option>
            <option value="month">Mes</option>
          </select>
        </div>

        <!-- Filtro de Tipo de Gráfico -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            <i class="fas fa-chart-line mr-2"></i>Tipo de Gráfico
          </label>
          <select
            [(ngModel)]="filters.chartType"
            (change)="onFilterChange()"
            class="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 transition duration-150 ease-in-out hover:bg-gray-100">
            <option value="line">Línea</option>
            <option value="bar">Barras</option>
            <option value="pie">Circular</option>
          </select>
        </div>
      </div>
    </div>
  `
})
export class PaymentFiltersComponent {
  @Input() filters: ChartFilters = {
    dateRange: 'month',
    groupBy: 'day',
    chartType: 'line'
  };

  @Output() filtersChange = new EventEmitter<ChartFilters>();

  onFilterChange(): void {
    this.filtersChange.emit({ ...this.filters });
  }
}
