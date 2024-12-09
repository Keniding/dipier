// interfaces/user.interface.ts
export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  active: boolean;
  role: string;
}

export interface UserRequest {
  username: string;
  email: string;
  password: string;
  active: boolean;
  role: string;
}

// services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { BaseApiService } from "./common/base-api-service.service";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseApiService {
  private apiUrl = `${environment.apiUrl}/user`;

  constructor(private http: HttpClient) {
    super();
  }

  getUsers(): Observable<User[]> {
    const headers = this.createHeaders();
    return this.http.get<User[]>(`${this.apiUrl}`, { headers });
  }

  getUser(userId: string): Observable<User> {
    const headers = this.createHeaders();
    return this.http.get<User>(`${this.apiUrl}/${userId}`, { headers });
  }

  storeUser(userRequest: UserRequest): Observable<User> {
    const headers = this.createHeaders();
    return this.http.post<User>(`${this.apiUrl}`, userRequest, { headers });
  }

  updateUser(userId: string, userRequest: UserRequest): Observable<User> {
    const headers = this.createHeaders();
    return this.http.put<User>(`${this.apiUrl}/${userId}`, userRequest, { headers });
  }

  deleteUser(userId: string): Observable<void> {
    const headers = this.createHeaders();
    return this.http.delete<void>(`${this.apiUrl}/${userId}`, { headers });
  }

  searchUsers(term: string): Observable<User[]> {
    const headers = this.createHeaders();
    return this.getUsers().pipe(
      map(users => {
        const searchTerm = term.toLowerCase().trim();
        return users.filter(user =>
          user.username.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm)
        );
      })
    );
  }
}
