// payment-method-dialog.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import {
  PaymentMethod,
  PaymentMethodType,
  DigitalWalletType,
  CurrencyType,
  PaymentDetails
} from '../../../../services/payment.service';

@Component({
  selector: 'app-payment-method-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  template: `
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-6">{{isEdit ? 'Editar' : 'Nuevo'}} Método de Pago</h2>

      <form [formGroup]="paymentForm" (ngSubmit)="onSubmit()">
        <!-- Tipo de método de pago -->
        <mat-form-field class="w-full mb-4">
          <mat-label>Tipo de Método</mat-label>
          <mat-select formControlName="methodType" (selectionChange)="onMethodTypeChange()">
            <mat-option *ngFor="let type of paymentMethodTypes" [value]="type">
              {{getMethodTypeLabel(type)}}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <!-- Campos dinámicos según el tipo de método -->
        <div [ngSwitch]="paymentForm.get('methodType')?.value" class="space-y-4">
          <!-- Tarjeta de Crédito/Débito -->
          <ng-container *ngSwitchCase="PaymentMethodType.TARJETA_CREDITO">
            <mat-form-field class="w-full">
              <mat-label>Número de Tarjeta</mat-label>
              <input matInput formControlName="cardNumber" placeholder="XXXX XXXX XXXX XXXX">
            </mat-form-field>
          </ng-container>

          <!-- Billetera Digital -->
          <ng-container *ngSwitchCase="PaymentMethodType.BILLETERA_DIGITAL">
            <mat-form-field class="w-full">
              <mat-label>Número de Teléfono</mat-label>
              <input matInput formControlName="phoneNumber" placeholder="999999999">
            </mat-form-field>

            <mat-form-field class="w-full">
              <mat-label>Tipo de Billetera</mat-label>
              <mat-select formControlName="walletType">
                <mat-option *ngFor="let type of walletTypes" [value]="type">
                  {{type}}
                </mat-option>
              </mat-select>
            </mat-form-field>
          </ng-container>

          <!-- Cuenta Bancaria -->
          <ng-container *ngSwitchCase="PaymentMethodType.BANCA">
            <mat-form-field class="w-full">
              <mat-label>Nombre del Banco</mat-label>
              <input matInput formControlName="bankName">
            </mat-form-field>

            <mat-form-field class="w-full">
              <mat-label>Número de Cuenta</mat-label>
              <input matInput formControlName="accountNumber">
            </mat-form-field>
          </ng-container>

          <!-- Efectivo -->
          <ng-container *ngSwitchCase="PaymentMethodType.EFECTIVO">
            <mat-form-field class="w-full">
              <mat-label>Moneda</mat-label>
              <mat-select formControlName="currency">
                <mat-option *ngFor="let currency of currencies" [value]="currency">
                  {{currency}}
                </mat-option>
              </mat-select>
            </mat-form-field>
          </ng-container>
        </div>

        <!-- Botones de acción -->
        <div class="flex justify-end gap-4 mt-6">
          <button mat-button type="button" (click)="onCancel()">
            Cancelar
          </button>
          <button mat-raised-button color="primary" type="submit" [disabled]="!paymentForm.valid">
            {{isEdit ? 'Actualizar' : 'Guardar'}}
          </button>
        </div>
      </form>
    </div>
  `
})
export class PaymentMethodDialogComponent implements OnInit {
  paymentForm!: FormGroup;
  isEdit: boolean = false;
  PaymentMethodType = PaymentMethodType;

  paymentMethodTypes: PaymentMethodType[] = Object.values(PaymentMethodType);
  walletTypes = Object.values(DigitalWalletType);
  currencies = Object.values(CurrencyType);

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<PaymentMethodDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      paymentMethod?: PaymentMethod,
      customerId: string
    }
  ) {
    this.isEdit = !!data.paymentMethod;
    this.initForm();
  }

  ngOnInit() {
    if (this.isEdit && this.data.paymentMethod) {
      this.setFormValues(this.data.paymentMethod);
    }
  }

  private initForm() {
    this.paymentForm = this.fb.group({
      methodType: [null as PaymentMethodType | null, Validators.required],
      cardNumber: [''],
      phoneNumber: [''],
      walletType: [null as DigitalWalletType | null],
      bankName: [''],
      accountNumber: [''],
      currency: [null as CurrencyType | null]
    });
  }

  private setFormValues(paymentMethod: PaymentMethod) {
    this.paymentForm.patchValue({
      methodType: paymentMethod.methodType
    });

    if (paymentMethod.details && paymentMethod.details.length > 0) {
      const details = paymentMethod.details[0];
      switch (details.type) {
        case 'CARD':
          this.paymentForm.patchValue({ cardNumber: details.cardNumber });
          break;
        case 'WALLET':
          this.paymentForm.patchValue({
            phoneNumber: details.phoneNumber,
            walletType: details.walletType
          });
          break;
        case 'BANK_ACCOUNT':
          this.paymentForm.patchValue({
            bankName: details.bankName,
            accountNumber: details.accountNumber
          });
          break;
        case 'CASH':
          this.paymentForm.patchValue({ currency: details.currency });
          break;
      }
    }
  }

  onMethodTypeChange() {
    // Resetear los campos específicos y sus validadores
    const controls = ['cardNumber', 'phoneNumber', 'walletType', 'bankName', 'accountNumber', 'currency'];
    controls.forEach(control => {
      const formControl = this.paymentForm.get(control);
      if (formControl) {
        formControl.clearValidators();
        formControl.setValue('');
      }
    });

    // Actualizar validadores según el tipo
    const methodType = this.paymentForm.get('methodType')?.value as PaymentMethodType;
    switch (methodType) {
      case PaymentMethodType.TARJETA_CREDITO:
      case PaymentMethodType.TARJETA_DEBITO:
        this.paymentForm.get('cardNumber')?.setValidators([Validators.required]);
        break;
      case PaymentMethodType.BILLETERA_DIGITAL:
        this.paymentForm.get('phoneNumber')?.setValidators([Validators.required]);
        this.paymentForm.get('walletType')?.setValidators([Validators.required]);
        break;
      case PaymentMethodType.BANCA:
        this.paymentForm.get('bankName')?.setValidators([Validators.required]);
        this.paymentForm.get('accountNumber')?.setValidators([Validators.required]);
        break;
      case PaymentMethodType.EFECTIVO:
        this.paymentForm.get('currency')?.setValidators([Validators.required]);
        break;
    }

    // Actualizar validez de todos los controles
    Object.keys(this.paymentForm.controls).forEach(key => {
      this.paymentForm.get(key)?.updateValueAndValidity();
    });
  }

  getMethodLabel(type: PaymentMethodType): string {
    const labels: Record<PaymentMethodType, string> = {
      [PaymentMethodType.TARJETA_CREDITO]: 'Tarjeta de Crédito',
      [PaymentMethodType.TARJETA_DEBITO]: 'Tarjeta de Débito',
      [PaymentMethodType.BILLETERA_DIGITAL]: 'Billetera Digital',
      [PaymentMethodType.BANCA]: 'Cuenta Bancaria',
      [PaymentMethodType.EFECTIVO]: 'Efectivo'
    };
    return labels[type] || 'Método de Pago';
  }

  onSubmit() {
    if (this.paymentForm.valid) {
      const formValue = this.paymentForm.value;
      const details: PaymentDetails[] = [];

      switch (formValue.methodType as PaymentMethodType) {
        case PaymentMethodType.TARJETA_CREDITO:
        case PaymentMethodType.TARJETA_DEBITO:
          details.push({
            type: 'CARD',
            cardNumber: formValue.cardNumber
          });
          break;
        case PaymentMethodType.BILLETERA_DIGITAL:
          details.push({
            type: 'WALLET',
            phoneNumber: formValue.phoneNumber,
            walletType: formValue.walletType
          });
          break;
        case PaymentMethodType.BANCA:
          details.push({
            type: 'BANK_ACCOUNT',
            bankName: formValue.bankName,
            accountNumber: formValue.accountNumber
          });
          break;
        case PaymentMethodType.EFECTIVO:
          details.push({
            type: 'CASH',
            currency: formValue.currency
          });
          break;
      }

      const paymentMethod: Partial<PaymentMethod> = {
        customerId: this.data.customerId,
        methodType: formValue.methodType as PaymentMethodType,
        details: details,
        transactionDate: new Date().toISOString()
      };

      if (this.isEdit && this.data.paymentMethod?.id) {
        paymentMethod.id = this.data.paymentMethod.id;
      }

      this.dialogRef.close(paymentMethod);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  getMethodTypeLabel(type: string): string {
    return this.getMethodLabel(type as PaymentMethodType);
  }
}
