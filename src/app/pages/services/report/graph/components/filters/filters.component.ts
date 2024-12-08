import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartFilters } from '../../../../../../services/report.service';

interface FilterOption {
  value: string;
  label: string;
  icon?: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-payment-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-xl shadow-lg p-6 m-2 transition-all duration-300 hover:shadow-xl">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Filtro de Rango de Fecha -->
        <div class="space-y-2 relative group">
          <label class="block text-sm font-medium text-gray-700 flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
            </svg>
            <span>Rango de Fecha</span>
          </label>
          <select
            [(ngModel)]="filters.dateRange"
            (change)="onFilterChange()"
            [attr.aria-label]="'Seleccionar rango de fecha'"
            class="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg
                   focus:ring-blue-500 focus:border-blue-500 p-2.5
                   transition duration-150 ease-in-out hover:bg-gray-100
                   appearance-none cursor-pointer">
            <option *ngFor="let option of dateRangeOptions"
                    [value]="option.value"
                    [disabled]="option.disabled">
              {{ option.label }}
            </option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </div>
        </div>

        <!-- Filtro de Agrupación -->
        <div class="space-y-2 relative group">
          <label class="block text-sm font-medium text-gray-700 flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/>
            </svg>
            <span>Agrupar Por</span>
          </label>
          <select
            [(ngModel)]="filters.groupBy"
            (change)="onFilterChange()"
            [attr.aria-label]="'Seleccionar agrupación'"
            [disabled]="!isGroupByEnabled()"
            class="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg
                   focus:ring-blue-500 focus:border-blue-500 p-2.5
                   transition duration-150 ease-in-out hover:bg-gray-100
                   disabled:opacity-50 disabled:cursor-not-allowed
                   appearance-none cursor-pointer">
            <option *ngFor="let option of groupByOptions"
                    [value]="option.value"
                    [disabled]="!isGroupByOptionValid(option.value)">
              {{ option.label }}
            </option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </div>
        </div>

        <!-- Filtro de Tipo de Gráfico -->
        <div class="space-y-2 relative group">
          <label class="text-sm font-medium text-gray-700 flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"/>
              <path d="M12 2.252A8 8 0 0112 18.25v-8H4.252a8 8 0 018-8z"/>
            </svg>
            <span>Tipo de Gráfico</span>
          </label>
          <select
            [(ngModel)]="filters.chartType"
            (change)="onFilterChange()"
            [attr.aria-label]="'Seleccionar tipo de gráfico'"
            class="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg
                   focus:ring-blue-500 focus:border-blue-500 p-2.5
                   transition duration-150 ease-in-out hover:bg-gray-100
                   appearance-none cursor-pointer">
            <option *ngFor="let option of chartTypeOptions" [value]="option.value">
              {{ option.label }}
            </option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Tooltip de ayuda -->
      <div class="mt-4 text-sm text-gray-500 italic">
        <p class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
          </svg>
          Seleccione los filtros para personalizar la visualización del gráfico
        </p>
      </div>
    </div>
  `,
  styles: [`
    .group:hover label { color: #3B82F6; }
    .group:hover select { border-color: #3B82F6; }
  `]
})
export class PaymentFiltersComponent implements OnInit {
  @Input() filters: ChartFilters = {
    dateRange: 'month',
    groupBy: 'day',
    chartType: 'line'
  };

  @Output() filtersChange = new EventEmitter<ChartFilters>();

  dateRangeOptions: FilterOption[] = [
    { value: 'week', label: 'Última Semana' },
    { value: 'month', label: 'Último Mes' },
    { value: 'year', label: 'Último Año' },
    { value: 'all', label: 'Todo' }
  ];

  groupByOptions: FilterOption[] = [
    { value: 'hour', label: 'Por Hora' },
    { value: 'day', label: 'Por Día' },
    { value: 'week', label: 'Por Semana' },
    { value: 'month', label: 'Por Mes' }
  ];

  chartTypeOptions: FilterOption[] = [
    { value: 'line', label: 'Gráfico de Línea' },
    { value: 'bar', label: 'Gráfico de Barras' },
    { value: 'pie', label: 'Gráfico Circular' },
    { value: 'doughnut', label: 'Gráfico de Dona' }
  ];

  ngOnInit(): void {
    this.validateInitialFilters();
  }

  onFilterChange(): void {
    // Validar y ajustar filtros si es necesario
    this.adjustGroupByBasedOnDateRange();
    this.filtersChange.emit({ ...this.filters });
  }

  private validateInitialFilters(): void {
    if (!this.dateRangeOptions.find(opt => opt.value === this.filters.dateRange)) {
      this.filters.dateRange = 'month';
    }
    if (!this.groupByOptions.find(opt => opt.value === this.filters.groupBy)) {
      this.filters.groupBy = 'day';
    }
    if (!this.chartTypeOptions.find(opt => opt.value === this.filters.chartType)) {
      this.filters.chartType = 'line';
    }
  }

  private adjustGroupByBasedOnDateRange(): void {
    const dateRangeGroupByMap = {
      'week': ['hour', 'day'],
      'month': ['day', 'week'],
      'year': ['week', 'month'],
      'all': ['month']
    };

    // @ts-ignore
    const validGroupings = dateRangeGroupByMap[this.filters.dateRange];
    if (!validGroupings.includes(this.filters.groupBy)) {
      this.filters.groupBy = validGroupings[0];
    }
  }

  isGroupByEnabled(): boolean {
    // @ts-ignore
    return this.filters.dateRange !== 'all';
  }

  isGroupByOptionValid(groupBy: string): boolean {
    const dateRangeGroupByMap = {
      'week': ['hour', 'day'],
      'month': ['day', 'week'],
      'year': ['week', 'month'],
      'all': ['month']
    };

    // @ts-ignore
    return dateRangeGroupByMap[this.filters.dateRange]?.includes(groupBy) ?? false;
  }
}
