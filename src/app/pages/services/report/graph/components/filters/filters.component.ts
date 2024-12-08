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
  templateUrl: 'filters.component.html',
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
    { value: 'day', label: 'Por Día' },
    { value: 'week', label: 'Por Semana' },
    { value: 'month', label: 'Por Mes' }
  ];

  chartTypeOptions: FilterOption[] = [
    { value: 'line', label: 'Gráfico de Línea' },
    { value: 'bar', label: 'Gráfico de Barras' }
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
