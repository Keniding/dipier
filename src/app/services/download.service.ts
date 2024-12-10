import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { BaseApiService } from "./common/base-api-service.service";

@Injectable({
  providedIn: 'root'
})
export class DownloadService extends BaseApiService {
  private apiUrl = `${environment.apiUrl}/downloads`;

  constructor(private http: HttpClient) {
    super();
  }

  /**
   * Descarga la factura en formato PDF
   * @param invoiceId ID de la factura
   * @returns Observable con el recurso PDF
   */
  downloadInvoice(invoiceId: string): Observable<Blob> {
    const headers = this.createHeaders();
    return this.http.get(`${this.apiUrl}/invoice/${invoiceId}`, {
      headers,
      responseType: 'blob'
    });
  }

  /**
   * Genera y descarga una cotización en PDF
   * @param quoteData Datos de la cotización
   * @returns Observable con el recurso PDF
   */
  downloadQuote(quoteData: Record<string, any>): Observable<Blob> {
    const headers = this.createHeaders();
    return this.http.post(`${this.apiUrl}/quote`, quoteData, {
      headers,
      responseType: 'blob'
    });
  }
}
