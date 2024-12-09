import { Injectable } from '@angular/core';
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { BaseApiService } from "./common/base-api-service.service";

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: Date;
  address: string;
  allergies: string[];
  chronicConditions: string[];
  lastVisit: Date;
}

export interface CustomerRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: Date;
  address: string;
  allergies: string[];
  chronicConditions: string[];
}

export interface BasicCustomer {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService extends BaseApiService {
  private apiUrl = `${environment.apiUrl}/customer`;

  constructor(private http: HttpClient) {
    super();
  }

  getCustomers(fullDetails: boolean = false): Observable<Customer[] | BasicCustomer[]> {
    const headers = this.createHeaders();
    const url = `${this.apiUrl}?fullDetails=${fullDetails}`;
    return this.http.get<Customer[] | BasicCustomer[]>(url, { headers });
  }

  getCustomer(id: string, fullDetails: boolean = false): Observable<Customer | BasicCustomer> {
    const headers = this.createHeaders();
    const url = `${this.apiUrl}/${id}?fullDetails=${fullDetails}`;
    return this.http.get<Customer | BasicCustomer>(url, { headers });
  }

  createCustomer(customer: CustomerRequest): Observable<void> {
    const headers = this.createHeaders();
    return this.http.post<void>(this.apiUrl, customer, { headers });
  }

  updateCustomer(id: string, customer: CustomerRequest): Observable<void> {
    const headers = this.createHeaders();
    return this.http.put<void>(`${this.apiUrl}/${id}`, customer, { headers });
  }

  deleteCustomer(id: string): Observable<void> {
    const headers = this.createHeaders();
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
  }
}
