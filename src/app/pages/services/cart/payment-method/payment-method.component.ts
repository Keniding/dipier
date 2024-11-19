import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  PaymentDetails,
  PaymentMethod,
  PaymentMethodService,
  CardDetails,
  DigitalWalletDetails,
  BankTransferDetails,
  CashPaymentDetails
} from '../../../../services/payment.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment-method',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-method.component.html',
  styleUrls: ['./payment-method.component.css']
})
export class PaymentMethodComponent implements OnInit {
  @Input() customerId: string | null = null;
  @Input() paymentMethods: PaymentMethod[] = [];
  @Input() selectedPaymentMethod: PaymentMethod | null = null;
  @Input() error: string | null = null;

  @Output() prevStepEvent = new EventEmitter<void>();
  @Output() paymentMethodChange = new EventEmitter<PaymentMethod>();
  @Output() confirmPaymentEvent = new EventEmitter<void>();

  loading: boolean = false;

  constructor(private paymentMethodService: PaymentMethodService) {}

  ngOnInit() {
    this.loadPaymentMethods();
  }

  loadPaymentMethods() {
    if (this.customerId) {
      this.loading = true;
      this.paymentMethodService.getPaymentMethods(this.customerId).subscribe({
        next: (methods) => {
          this.paymentMethods = methods;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al obtener los métodos de pago:', error);
          this.error = 'Error al cargar los métodos de pago';
          this.loading = false;
        }
      });
    }
  }

  onSelectPaymentMethod(method: PaymentMethod) {
    this.selectedPaymentMethod = method;
    this.paymentMethodChange.emit(method);
  }

  onConfirm() {
    if (this.selectedPaymentMethod) {
      this.confirmPaymentEvent.emit();
    }
  }

  onPrevStep() {
    this.prevStepEvent.emit();
  }

  getFirstDetail(method: PaymentMethod): PaymentDetails | undefined {
    return Array.isArray(method.details) ? method.details[0] : method.details;
  }

  isCardDetails(detail: PaymentDetails): detail is CardDetails {
    return detail.type === 'CARD';
  }

  isWalletDetails(detail: PaymentDetails): detail is DigitalWalletDetails {
    return detail.type === 'WALLET';
  }

  isBankDetails(detail: PaymentDetails): detail is BankTransferDetails {
    return detail.type === 'BANK_ACCOUNT';
  }

  isCashDetails(detail: PaymentDetails): detail is CashPaymentDetails {
    return detail.type === 'CASH';
  }

  getCardNumber(detail: PaymentDetails): string {
    return this.isCardDetails(detail) ? detail.cardNumber : '';
  }

  getPhoneNumber(detail: PaymentDetails): string {
    return this.isWalletDetails(detail) ? detail.phoneNumber : '';
  }

  getBankName(detail: PaymentDetails): string {
    return this.isBankDetails(detail) ? detail.bankName : '';
  }

  getCurrency(detail: PaymentDetails): string {
    return this.isCashDetails(detail) ? detail.currency : '';
  }
}
