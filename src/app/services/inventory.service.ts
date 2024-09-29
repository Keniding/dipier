import { Injectable } from '@angular/core';
import { environment } from "../../environments/environment";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";

interface Inventario {
  skuCode: string;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    if (typeof window !== 'undefined') {
      try {
        const token = localStorage.getItem("authToken");
        if (token) {
          headers = headers.set('Authorization', `Bearer ${token}`);
        } else {
          console.log('No token found in localStorage');
        }
      } catch (error) {
        console.error('Error accessing localStorage', error);
      }
    }
    return headers;
  }

  getInventories(): Observable<Inventario[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Inventario[]>(`${this.apiUrl}/inventory`, { headers });
  }

  getNumberLow(): Observable<Inventario[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Inventario[]>(`${this.apiUrl}/inventory/lowQuantity`, { headers });
  }
}
