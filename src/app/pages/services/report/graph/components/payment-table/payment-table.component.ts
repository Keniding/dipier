import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {PaymentHistory} from "../../../../../../services/report.service";

@Component({
  selector: 'app-payment-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-xl shadow-lg p-6 m-2">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-semibold text-gray-800">Últimos Pagos</h3>
        <div class="text-gray-500">
          <i class="fas fa-sync-alt hover:text-blue-500 cursor-pointer" (click)="onRefresh()"></i>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">
                ID Factura
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Monto
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">
                Fecha
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let payment of payments" class="hover:bg-gray-50 transition-colors duration-150">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{payment.invoiceId}}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span class="font-medium text-green-600">S/{{payment.amount | number:'1.2-2'}}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{payment.paymentDate | date:'medium'}}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class PaymentTableComponent {
  @Input() payments: PaymentHistory[] = [];
  @Output() refresh = new EventEmitter<void>();

  onRefresh() {
    this.refresh.emit();
  }
}
