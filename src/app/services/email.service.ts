// services/email.service.ts
import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { BaseApiService } from "./common/base-api-service.service";
import {AuthService} from "../login/auth/auth.service";
import {map} from "rxjs/operators";

export interface EmailRequest {
  to: string;
  subject: string;
  body: string;
  recipientName?: string;
  buttonText?: string;
  buttonUrl?: string;
  footerText?: string;
}

export interface EmailResponse {
  success: boolean;
  message: string;
  recipient: string;
  attachmentName?: string;
  templateUsed?: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmailService extends BaseApiService {
  private apiUrl = `${environment.apiUrl}/email`;

  constructor(private http: HttpClient, private authService: AuthService) {
    super();
  }

  sendEmail(emailRequest: EmailRequest): Observable<EmailResponse> {
    const headers = this.createHeaders();
    return this.http.post<EmailResponse>(`${this.apiUrl}/send`, emailRequest, {headers});
  }

  sendEmailWithTemplate(emailRequest: EmailRequest, templateName: string): Observable<EmailResponse> {
    const headers = this.createHeaders();
    return this.http.post<EmailResponse>(
      `${this.apiUrl}/send-template/${templateName}`,
      emailRequest,
      {headers}
    );
  }

  sendEmailWithAttachment(formData: FormData): Observable<EmailResponse> {
    const token = this.authService.getToken();

    return this.http.post<EmailResponse>(
      `${this.apiUrl}/send-with-attachment`,
      formData,
      {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        })
      }
    );
  }
}
