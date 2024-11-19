import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {BaseApiService} from "./common/base-api-service.service";
import {map} from "rxjs/operators";

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
export class ProductService  extends BaseApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
    super();
  }

  getProducts(): Observable<Producto[]> {
    const headers = this.createHeaders();
    return this.http.get<Producto[]>(`${this.apiUrl}/product`, { headers });
  }

  getProduct(productId: string): Observable<Producto> {
    const headers = this.createHeaders();
    return this.http.get<Producto>(`${this.apiUrl}/product/${productId}`, { headers });
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

  searchProducts(term: string): Observable<Producto[]> {
    const headers = this.createHeaders();
    return this.getProducts().pipe(
      map(products => {
        const searchTerm = term.toLowerCase().trim();
        return products.filter(product =>
          product.name.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm) ||
          product.skuCode.toLowerCase().includes(searchTerm)
        );
      })
    );
  }
}
