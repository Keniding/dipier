import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'app-payment-method',
  standalone: true,
  imports: [],
  templateUrl: './payment-method.component.html',
  styleUrl: './payment-method.component.css'
})
export class PaymentMethodComponent {
  @Output() prevStepEvent = new EventEmitter<void>();
  @Output() confirmPaymentEvent = new EventEmitter<void>();

  onPrevStep(): void {
    this.prevStepEvent.emit();
  }

  onConfirmPayment(): void {
    this.confirmPaymentEvent.emit();
  }
}
