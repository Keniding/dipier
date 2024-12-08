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
import {BillingService} from "../../../../services/invoice.service";
import {CustomerService} from "../../../../services/customer.service";
import {EmailRequest, EmailService} from "../../../../services/email.service";
import Swal from 'sweetalert2';

@Component({
  selector: 'app-payment-method',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './payment-method.component.html',
  styleUrls: ['./payment-method.component.css']
})


export class PaymentMethodComponent implements OnInit {
  @Input() customerId: string | null = null;
  @Input() paymentMethods: PaymentMethod[] = [];
  @Input() selectedPaymentMethod: PaymentMethod | null = null;
  @Input() error: string | null = null;
  @Input() totalAmount: number = 0;

  @Output() prevStepEvent = new EventEmitter<void>();
  @Output() paymentMethodChange = new EventEmitter<PaymentMethod>();
  @Output() confirmPaymentEvent = new EventEmitter<void>();
  @Output() paymentProcessed = new EventEmitter<string>();

  loading: boolean = false;
  processingPayment: boolean = false;

  constructor(
    private paymentMethodService: PaymentMethodService,
    private billingService: BillingService,
    private emailService: EmailService,
    private customerService: CustomerService
  ) {}

  ngOnInit() {
    this.loadPaymentMethods();
  }

  async onConfirm() {
    if (!this.selectedPaymentMethod || !this.customerId) {
      this.error = 'Por favor, seleccione un método de pago';
      return;
    }

    this.processingPayment = true;
    this.error = null;

    try {
      const total = Number(this.totalAmount.toFixed(2));
      const invoice = {
        id: '',
        customerId: this.customerId,
        totalAmount: this.totalAmount,
        status: 'PENDING',
        paymentDate: new Date().toISOString()
      };

      const createdInvoice = await this.billingService.createInvoice(invoice).toPromise();

      if (!createdInvoice) {
        throw new Error('Error al crear la factura');
      }

      await this.billingService.processInvoice(this.customerId).toPromise();

      const updatedInvoice = {
        ...createdInvoice,
        status: 'COMPLETED',
        paymentDate: new Date().toISOString()
      };

      await this.billingService.updateInvoice(updatedInvoice).toPromise();

      // Obtener los datos del cliente
      this.customerService.getCustomers(true).subscribe({
        next: (customers) => {
          const customer = customers.find(c => c.id === this.customerId);
          if (customer) {
            const emailRequest: EmailRequest = {
              to: customer.email,
              subject: `Confirmación de Pago - Factura #${createdInvoice.id}`,
              body: `Se ha procesado su pago por $${this.totalAmount}`,
              recipientName: `${customer.firstName} ${customer.lastName}`,
              buttonText: 'Ver Factura',
              buttonUrl: `/invoices/${createdInvoice.id}`,
              footerText: 'Gracias por su compra'
            };

            // Mostrar loading mientras se envía el email
            Swal.fire({
              title: 'Enviando email...',
              text: 'Por favor espere',
              allowOutsideClick: false,
              allowEscapeKey: false,
              allowEnterKey: false,
              didOpen: () => {
                Swal.showLoading();
              }
            });

            this.emailService.sendEmail(emailRequest).subscribe({
              next: () => {
                Swal.close(); // Cerrar el loading
                Swal.fire({
                  icon: 'success',
                  title: 'Éxito',
                  text: 'Email enviado correctamente',
                  timer: 3000,
                  showConfirmButton: false
                });
              },
              error: (error) => {
                Swal.close(); // Cerrar el loading
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: 'No se pudo enviar el email'
                });
              }
            });
          }
        },
        error: (error) => {
          console.error('Error al obtener datos del cliente:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al obtener datos del cliente'
          });
        }
      });

      this.paymentProcessed.emit(createdInvoice.id);
      this.confirmPaymentEvent.emit();

    } catch (error) {
      console.error('Error en el proceso de pago:', error);
      this.error = 'Error al procesar el pago. Por favor, intente nuevamente.';
    } finally {
      this.processingPayment = false;
    }
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
