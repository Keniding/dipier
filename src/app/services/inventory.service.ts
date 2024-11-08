import { Injectable } from '@angular/core';
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import {BaseApiService} from "./common/base-api-service.service";

interface Inventario {
  skuCode: string;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService extends BaseApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
    super();
  }

  getInventories(): Observable<Inventario[]> {
    const headers = this.createHeaders();
    return this.http.get<Inventario[]>(`${this.apiUrl}/inventory`, { headers });
  }

  getNumberLow(): Observable<Inventario[]> {
    const headers = this.createHeaders();
    return this.http.get<Inventario[]>(`${this.apiUrl}/inventory/lowQuantity`, { headers });
  }
}
