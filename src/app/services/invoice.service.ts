import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { BaseApiService } from "./common/base-api-service.service";

// Interfaces
interface Invoice {
  id: string;
  customerId: string;
  totalAmount: number;
  status: string;
  paymentDate: string;
}

interface PaymentHistory {
  id: string;
  invoiceId: string;
  amount: number;
  paymentDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class BillingService extends BaseApiService {
  private apiUrl = `${environment.apiUrl}/billing`;

  constructor(private http: HttpClient) {
    super();
  }

  getAllInvoices(customerId: string): Observable<Invoice[]> {
    const headers = this.createHeaders();
    return this.http.get<Invoice[]>(`${this.apiUrl}/invoices/${customerId}`, { headers });
  }

  createInvoice(invoice: Invoice): Observable<Invoice> {
    const headers = this.createHeaders();
    return this.http.post<Invoice>(`${this.apiUrl}/invoice`, invoice, { headers });
  }

  getInvoice(id: string): Observable<Invoice> {
    const headers = this.createHeaders();
    return this.http.get<Invoice>(`${this.apiUrl}/invoice/${id}`, { headers });
  }

  updateInvoice(invoice: Invoice): Observable<Invoice> {
    const headers = this.createHeaders();
    return this.http.put<Invoice>(`${this.apiUrl}/invoice`, invoice, { headers });
  }

  deleteInvoice(id: string): Observable<void> {
    const headers = this.createHeaders();
    return this.http.delete<void>(`${this.apiUrl}/invoice/${id}`, { headers });
  }

  processInvoice(customerId: string): Observable<string> {
    const headers = this.createHeaders();
    return this.http.post<string>(
      `${this.apiUrl}/process-invoice`,
      null,
      {
        headers,
        params: { customerId },
        responseType: 'text' as 'json' // Porque el endpoint devuelve un String
      }
    );
  }
}
