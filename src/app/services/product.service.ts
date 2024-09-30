import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

interface Producto {
  id: string;
  name: string;
  description: string;
  skuCode: string;
  price: number;
  categories: { id: string; name: string }[];
}

interface ProductRequest {
  name: string;
  description: string;
  skuCode: string;
  price: number;
  categories: { id: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private createHeaders(contentType: string = 'application/json'): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': contentType
    });

    if (typeof window !== 'undefined') {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          headers = headers.set('Authorization', `Bearer ${token}`);
        } else {
          console.warn('No token found in localStorage');
        }
      } catch (error) {
        console.error('Error accessing localStorage', error);
      }
    }

    return headers;
  }

  getProducts(): Observable<Producto[]> {
    const headers = this.createHeaders();
    return this.http.get<Producto[]>(`${this.apiUrl}/product`, { headers });
  }

  storeProduct(productRequest: ProductRequest): Observable<Producto> {
    const headers = this.createHeaders();
    return this.http.post<Producto>(`${this.apiUrl}/product`, productRequest, { headers });
  }

  updateProduct(productId: string, productRequest: ProductRequest) {
    const headers = this.createHeaders();
    return this.http.put<Producto>(`${this.apiUrl}/product/${productId}`, productRequest, { headers });
  }

  deleteProduct(productId: string) {
    const headers = this.createHeaders();
    return this.http.delete<string>(`${this.apiUrl}/product/${productId}`, { headers });
  }
}
