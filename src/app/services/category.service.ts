import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Category {
  id: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getCategories(): Observable<Category[]> {
    let headers = new HttpHeaders();
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

    return this.http.get<Category[]>(`${this.apiUrl}/category`, { headers });
  }
}
