import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { CommonModule } from "@angular/common";
import {
  PaymentMethod,
  PaymentMethodType,
  PaymentMethodService,
  PaymentDetails,
  CardDetails,
  DigitalWalletDetails,
  BankTransferDetails,
  CashPaymentDetails
} from "../../../../services/payment.service";
import { ConfirmDialogComponent } from "../confirm-dialog/confirm-dialog.component";
import {PaymentMethodDialogComponent} from "../payment-method-dialog/payment-method-dialog.component";

@Component({
  selector: 'app-payment-methods',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    CommonModule
  ],
  templateUrl: 'payment-methods.component.html',
  styleUrl: 'payment-methods.component.css'
})
export class PaymentMethodsComponent implements OnInit {
  customerId: string = '';
  paymentMethods: PaymentMethod[] = [];

  constructor(
    private route: ActivatedRoute,
    private paymentMethodService: PaymentMethodService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.customerId = params['id'];
      this.loadPaymentMethods();
    });
  }

  // Type guard functions
  getCardDetails(details: PaymentDetails): CardDetails {
    return details as CardDetails;
  }

  getWalletDetails(details: PaymentDetails): DigitalWalletDetails {
    return details as DigitalWalletDetails;
  }

  getBankDetails(details: PaymentDetails): BankTransferDetails {
    return details as BankTransferDetails;
  }

  getCashDetails(details: PaymentDetails): CashPaymentDetails {
    return details as CashPaymentDetails;
  }

  loadPaymentMethods() {
    this.paymentMethodService.getPaymentMethods(this.customerId).subscribe({
      next: (methods) => {
        this.paymentMethods = methods;
      },
      error: (error) => {
        this.showError('Error al cargar los métodos de pago');
        console.error('Error:', error);
      }
    });
  }

  getMethodBackground(type: PaymentMethodType): string {
    const backgrounds = {
      [PaymentMethodType.TARJETA_CREDITO]: 'bg-gradient-to-r from-blue-600 to-blue-700',
      [PaymentMethodType.TARJETA_DEBITO]: 'bg-gradient-to-r from-green-600 to-green-700',
      [PaymentMethodType.BILLETERA_DIGITAL]: 'bg-gradient-to-r from-purple-600 to-purple-700',
      [PaymentMethodType.BANCA]: 'bg-gradient-to-r from-indigo-600 to-indigo-700',
      [PaymentMethodType.EFECTIVO]: 'bg-gradient-to-r from-yellow-600 to-yellow-700'
    };
    return backgrounds[type] || 'bg-gradient-to-r from-gray-600 to-gray-700';
  }

  getMethodIcon(type: PaymentMethodType): string {
    const icons = {
      [PaymentMethodType.TARJETA_CREDITO]: 'credit_card',
      [PaymentMethodType.TARJETA_DEBITO]: 'credit_card',
      [PaymentMethodType.BILLETERA_DIGITAL]: 'account_balance_wallet',
      [PaymentMethodType.BANCA]: 'account_balance',
      [PaymentMethodType.EFECTIVO]: 'payments'
    };
    return icons[type] || 'payment';
  }

  getMethodLabel(type: PaymentMethodType): string {
    const labels = {
      [PaymentMethodType.TARJETA_CREDITO]: 'Tarjeta de Crédito',
      [PaymentMethodType.TARJETA_DEBITO]: 'Tarjeta de Débito',
      [PaymentMethodType.BILLETERA_DIGITAL]: 'Billetera Digital',
      [PaymentMethodType.BANCA]: 'Cuenta Bancaria',
      [PaymentMethodType.EFECTIVO]: 'Efectivo'
    };
    return labels[type] || 'Método de Pago';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  getLastFourDigits(number: string): string {
    return number.slice(-4);
  }

  addPaymentMethod() {
    const dialogRef = this.dialog.open(PaymentMethodDialogComponent, {
      width: '500px',
      data: {
        customerId: this.customerId
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.paymentMethodService.addPaymentMethod(result).subscribe({
          next: () => {
            this.showSuccess('Método de pago agregado correctamente');
            this.loadPaymentMethods();
          },
          error: (error) => {
            this.showError('Error al agregar el método de pago');
            console.error('Error:', error);
          }
        });
      }
    });
  }

  editPaymentMethod(paymentMethod: PaymentMethod) {
    const dialogRef = this.dialog.open(PaymentMethodDialogComponent, {
      width: '500px',
      data: {
        paymentMethod: paymentMethod,
        customerId: this.customerId
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.paymentMethodService.updatePaymentMethod(paymentMethod.id, result).subscribe({
          next: () => {
            this.showSuccess('Método de pago actualizado correctamente');
            this.loadPaymentMethods();
          },
          error: (error) => {
            this.showError('Error al actualizar el método de pago');
            console.error('Error:', error);
          }
        });
      }
    });
  }

  deletePaymentMethod(methodId: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: '¿Está seguro que desea eliminar este método de pago?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.paymentMethodService.deletePaymentMethod(methodId).subscribe({
          next: () => {
            this.showSuccess('Método de pago eliminado correctamente');
            this.loadPaymentMethods();
          },
          error: (error) => {
            this.showError('Error al eliminar el método de pago');
            console.error('Error:', error);
          }
        });
      }
    });
  }

  private showSuccess(message: string) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }
}
