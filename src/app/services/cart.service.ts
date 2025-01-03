import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, tap} from 'rxjs';
import { environment } from '../../environments/environment';
import { BaseApiService } from "./common/base-api-service.service";
import {CreateCartItem} from "../models/cart.types";

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
}

interface Cart {
  id: string;
  customerId: string;
  items: CartItem[];
  status: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED' | 'EXPIRED';
  createdDate: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CartService extends BaseApiService {
  private apiUrl = `${environment.apiUrl}/cart`;

  constructor(private http: HttpClient) {
    super();
  }

  getCart(customerId: string): Observable<Cart> {
    const headers = this.createHeaders();
    return this.http.get<Cart>(`${this.apiUrl}/${customerId}/cart`, { headers });
  }

  getCartItems(customerId: string): Observable<CartItem[]> {
    const headers = this.createHeaders();
    return this.http.get<CartItem[]>(`${this.apiUrl}/${customerId}/items`, { headers });
  }

  addItemToCart(customerId: string, item: CreateCartItem): Observable<void> {
    const headers = this.createHeaders();
    return this.http.post<void>(`${this.apiUrl}/${customerId}/add`, item, { headers });
  }

  removeItemFromCart(customerId: string, productId: string): Observable<void> {
    console.log(`Attempting to remove item with productId ${productId} for customer ${customerId}`);
    const headers = this.createHeaders();
    const cartItem = {
      productId: productId
    };
    console.log('Sending request with body:', cartItem);

    return this.http.delete<void>(`${this.apiUrl}/${customerId}/remove`, {
      headers,
      body: cartItem
    }).pipe(
      tap({
        next: () => console.log('Delete request successful'),
        error: (error) => console.error('Delete request failed:', error)
      })
    );
  }

  updateItemQuantity(customerId: string, productId: string, quantity: number): Observable<void> {
    const headers = this.createHeaders();
    return this.http.put<void>(
      `${this.apiUrl}/${customerId}/update/${productId}?quantity=${quantity}`,
      null,
      { headers }
    );
  }

  clearCart(customerId: string): Observable<void> {
    const headers = this.createHeaders();
    return this.http.delete<void>(`${this.apiUrl}/${customerId}/clear`, { headers });
  }

  isProductInCart(customerId: string, productId: string): Observable<boolean> {
    const headers = this.createHeaders();
    return this.http.get<boolean>(
      `${this.apiUrl}/${customerId}/contains/${productId}`,
      { headers }
    );
  }

  getCartTotal(customerId: string): Observable<number> {
    const headers = this.createHeaders();
    return this.http.get<number>(`${this.apiUrl}/${customerId}/total`, { headers });
  }
}
