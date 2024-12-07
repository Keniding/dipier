import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { BaseApiService } from "./common/base-api-service.service";
import {map} from "rxjs/operators";

export interface PaymentHistory {
  id?: string;
  invoiceId: string;
  amount: number;
  paymentDate: string;
}

export interface PaymentHistoryRequest {
  invoiceId: string;
  amount: number;
  paymentDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentHistoryService extends BaseApiService {
  private apiUrl = `${environment.apiUrl}/payment-history`;

  constructor(private http: HttpClient) {
    super();
  }

  getAllPaymentHistory(): Observable<PaymentHistory[]> {
    const headers = this.createHeaders();
    return this.http.get<PaymentHistory[]>(this.apiUrl, { headers });
  }

  getPaymentHistory(id: string): Observable<PaymentHistory> {
    const headers = this.createHeaders();
    return this.http.get<PaymentHistory>(`${this.apiUrl}/${id}`, { headers });
  }

  createPaymentHistory(payment: PaymentHistoryRequest): Observable<PaymentHistory> {
    const headers = this.createHeaders();
    return this.http.post<PaymentHistory>(this.apiUrl, payment, { headers });
  }

  updatePaymentHistory(id: string, payment: PaymentHistoryRequest): Observable<PaymentHistory> {
    const headers = this.createHeaders();
    return this.http.put<PaymentHistory>(`${this.apiUrl}/${id}`, payment, { headers });
  }

  deletePaymentHistory(id: string): Observable<void> {
    const headers = this.createHeaders();
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
  }

  searchPaymentHistory(term: string): Observable<PaymentHistory[]> {
    const headers = this.createHeaders();
    return this.getAllPaymentHistory().pipe(
      map(payments => {
        const searchTerm = term.toLowerCase().trim();
        return payments.filter(payment =>
          payment.invoiceId.toLowerCase().includes(searchTerm)
        );
      })
    );
  }
}
