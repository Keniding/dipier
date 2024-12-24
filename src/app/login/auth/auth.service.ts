// services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User } from "../../services/user.service";
import { jwtDecode } from 'jwt-decode';

interface AuthResponse {
  token: string;
  user: any;
}

interface DecodedToken {
  sub: string;
  exp: number;
  user: any;
  expirationDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/gt';
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.checkAuthStatus();
  }

  private checkAuthStatus() {
    const token = this.getToken();
    if (token) {
      const decodedToken = this.decodeToken(token);
      if (decodedToken && !this.isTokenExpired(decodedToken)) {
        const user = decodedToken.user;
        this.currentUserSubject.next(user);
      } else {
        this.logout();
      }
    }
  }

  private decodeToken(token: string): DecodedToken | null {
    try {
      return jwtDecode(token);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  private isTokenExpired(decodedToken: DecodedToken): boolean {
    if (!decodedToken.exp) return true;
    const expirationDate = new Date(decodedToken.exp * 1000);
    return expirationDate <= new Date();
  }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        tap(response => {
          localStorage.setItem('authToken', response.token);
          const decodedToken = this.decodeToken(response.token);
          if (decodedToken) {
            this.currentUserSubject.next(decodedToken.user);
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem('authToken');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    const decodedToken = this.decodeToken(token);
    return decodedToken ? !this.isTokenExpired(decodedToken) : false;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  updateCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
  } 
}
