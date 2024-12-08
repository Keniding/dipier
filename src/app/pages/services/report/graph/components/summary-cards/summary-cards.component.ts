import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentSummary } from '../../models/payment.models';

@Component({
  selector: 'app-summary-cards',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 m-2">
      <!-- Total Card -->
      <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
        <div class="flex items-center justify-between mb-4">
          <div class="text-sm font-medium text-gray-500">Total Pagado</div>
          <div class="p-2 bg-green-100 rounded-lg">
            <i class="fas fa-money-bill-wave text-green-600"></i>
          </div>
        </div>
        <div class="flex items-baseline">
          <span class="text-2xl font-bold text-gray-900">S/{{ summary.total | number:'1.2-2' }}</span>
        </div>
      </div>

      <!-- Average Card -->
      <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
        <div class="flex items-center justify-between mb-4">
          <div class="text-sm font-medium text-gray-500">Promedio</div>
          <div class="p-2 bg-blue-100 rounded-lg">
            <i class="fas fa-chart-line text-blue-600"></i>
          </div>
        </div>
        <div class="flex items-baseline">
          <span class="text-2xl font-bold text-gray-900">S/{{ summary.average | number:'1.2-2' }}</span>
        </div>
      </div>

      <!-- Maximum Card -->
      <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
        <div class="flex items-center justify-between mb-4">
          <div class="text-sm font-medium text-gray-500">Pago Máximo</div>
          <div class="p-2 bg-purple-100 rounded-lg">
            <i class="fas fa-arrow-up text-purple-600"></i>
          </div>
        </div>
        <div class="flex items-baseline">
          <span class="text-2xl font-bold text-gray-900">S/{{ summary.max | number:'1.2-2' }}</span>
        </div>
      </div>

      <!-- Minimum Card -->
      <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
        <div class="flex items-center justify-between mb-4">
          <div class="text-sm font-medium text-gray-500">Pago Mínimo</div>
          <div class="p-2 bg-red-100 rounded-lg">
            <i class="fas fa-arrow-down text-red-600"></i>
          </div>
        </div>
        <div class="flex items-baseline">
          <span class="text-2xl font-bold text-gray-900">S/{{ summary.min | number:'1.2-2' }}</span>
        </div>
      </div>
    </div>
  `
})
export class SummaryCardsComponent {
  @Input() summary: PaymentSummary = {
    total: 0,
    average: 0,
    max: 0,
    min: 0
  };
}
