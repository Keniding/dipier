import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {Category} from "./category.service";

interface Inventario {
  skuCode: String,
  quantity: number
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}


  getInventories(): Observable<Inventario[]> {
    let header: HttpHeaders = new HttpHeaders();

    let headers;
    if (typeof window != 'undefined') {
      try {
        const token = localStorage.getItem("authToken");
        if (token) {
          headers = header.set('Authorization', `Bearer ${token}`);
        } else {
          console.log('No token found in localStorage')
        }
      } catch (error) {
        console.error('Error accessing localStorage', error);
      }
    }

    return this.http.get<Inventario[]>(`${this.apiUrl}/inventory`, {headers});
  }
}
