import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {BaseApiService} from "./common/base-api-service.service";

export interface Category {
  id: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService  extends BaseApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
    super();
  }

  getCategories(): Observable<Category[]> {
    const headers = this.createHeaders();
    return this.http.get<Category[]>(`${this.apiUrl}/category`, { headers });
  }
}
