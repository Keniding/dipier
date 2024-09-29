import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";

interface Customer {
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

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
  }

  getCustomers(fullDetails: boolean = false): Observable<Customer[]> {
    let header: HttpHeaders = new HttpHeaders();

    let headers;
    if (typeof window !== 'undefined') {
      try {
        const token = localStorage.getItem("authToken");
        if (token) {
          headers = header.set('Authorization', `Bearer ${token}`);
        } else {
          console.log('No token found in localStorage');
        }
      } catch (error) {
        console.error('Error accessing localStorage', error);
      }
    }

    const url = `${this.apiUrl}/customer?fullDetails=${fullDetails}`;

    return this.http.get<Customer[]>(url, { headers });
  }
}
