import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-payment-header',
  standalone: true,
  template: `
    <div class="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-8 text-white shadow-xl m-2">
      <h2 class="text-3xl font-bold mb-2">{{title}}</h2>
      <p class="text-blue-100">{{subtitle}}</p>
    </div>
  `
})
export class PaymentHeaderComponent {
  @Input() title = 'Historial de Pagos';
  @Input() subtitle = 'Analiza y visualiza el historial completo de transacciones';
}
