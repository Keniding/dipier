import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { BaseApiService } from "./common/base-api-service.service";

// Enums
export enum PaymentMethodType {
  EFECTIVO = 'EFECTIVO',
  TARJETA_CREDITO = 'TARJETA_CREDITO',
  TARJETA_DEBITO = 'TARJETA_DEBITO',
  BILLETERA_DIGITAL = 'BILLETERA_DIGITAL',
  BANCA = 'BANCA'
}

export enum DigitalWalletType {
  YAPE = 'YAPE',
  PLIN = 'PLIN'
}

export enum CurrencyType {
  EUR = 'EUR',
  USD = 'USD',
  SOL = 'SOL'
}

// Interfaces para los detalles de pago
export interface CardDetails {
  type: 'CARD';
  cardNumber: string;
}

export interface DigitalWalletDetails {
  type: 'WALLET';
  phoneNumber: string;
  walletType: DigitalWalletType;
}

export interface BankTransferDetails {
  type: 'BANK_ACCOUNT';
  accountNumber: string;
  bankName: string;
}

export interface CashPaymentDetails {
  type: 'CASH';
  currency: CurrencyType;
}

export type PaymentDetails = CardDetails | DigitalWalletDetails | BankTransferDetails | CashPaymentDetails;

// Interface principal para PaymentMethod
export interface PaymentMethod {
  id: string;
  customerId: string;
  methodType: PaymentMethodType;
  details: PaymentDetails[];
  transactionDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentMethodService extends BaseApiService {
  private apiUrl = `${environment.apiUrl}/payment-methods`;

  constructor(private http: HttpClient) {
    super();
  }

  getPaymentMethods(customerId: string): Observable<PaymentMethod[]> {
    const headers = this.createHeaders();
    return this.http.get<PaymentMethod[]>(`${this.apiUrl}?costumerId=${customerId}`, { headers });
  }

  addPaymentMethod(paymentMethod: Omit<PaymentMethod, 'id'>): Observable<PaymentMethod> {
    const headers = this.createHeaders();
    return this.http.post<PaymentMethod>(this.apiUrl, paymentMethod, { headers });
  }

  updatePaymentMethod(methodId: string, paymentMethod: PaymentMethod): Observable<PaymentMethod> {
    const headers = this.createHeaders();
    return this.http.put<PaymentMethod>(`${this.apiUrl}/${methodId}`, paymentMethod, { headers });
  }

  deletePaymentMethod(methodId: string): Observable<void> {
    const headers = this.createHeaders();
    return this.http.delete<void>(`${this.apiUrl}/${methodId}`, { headers });
  }
}
