import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { BaseApiService } from "./common/base-api-service.service";
import {map} from "rxjs/operators";

export interface CategoryResponse {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
}


export interface CategoryRequest {
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService extends BaseApiService {
  private apiUrl = `${environment.apiUrl}/category`;

  constructor(private http: HttpClient) {
    super();
  }

  // Obtener todas las categorías
  getCategories(): Observable<CategoryResponse[]> {
    const headers = this.createHeaders();
    return this.http.get<CategoryResponse[]>(this.apiUrl, { headers });
  }

  // Obtener una categoría por ID
  getCategory(id: string): Observable<CategoryResponse> {
    const headers = this.createHeaders();
    return this.http.get<CategoryResponse>(`${this.apiUrl}/${id}`, { headers });
  }

  // Crear una nueva categoría
  createCategory(category: CategoryRequest): Observable<void> {
    const headers = this.createHeaders();
    return this.http.post<void>(this.apiUrl, category, { headers });
  }

  updateCategory(id: string, category: CategoryRequest): Observable<any> {
    const headers = this.createHeaders();
    return this.http.put(`${this.apiUrl}/${id}`, category, {
      headers,
      responseType: 'text'
    }).pipe(
      map(response => {
        try {
          return JSON.parse(response);
        } catch {
          return { message: response };
        }
      })
    );
  }

  // Eliminar una categoría
  deleteCategory(id: string): Observable<void> {
    const headers = this.createHeaders();
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
  }
}
