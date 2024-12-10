import { HttpHeaders } from "@angular/common/http";

export abstract class BaseApiService {
  protected createHeaders(contentType: string = 'application/json'): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': contentType
    });

    return this.addAuthorizationHeader(headers);
  }

  protected createUploadHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    return this.addAuthorizationHeader(headers);
  }

  protected addAuthorizationHeader(headers: HttpHeaders): HttpHeaders {
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
    return headers;
  }
}
