// services/email.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { BaseApiService } from "./common/base-api-service.service";

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

  constructor(private http: HttpClient) {
    super();
  }

  sendEmail(emailRequest: EmailRequest): Observable<EmailResponse> {
    const headers = this.createHeaders();
    return this.http.post<EmailResponse>(`${this.apiUrl}/send`, emailRequest, { headers });
  }

  sendEmailWithTemplate(emailRequest: EmailRequest, templateName: string): Observable<EmailResponse> {
    const headers = this.createHeaders();
    return this.http.post<EmailResponse>(
      `${this.apiUrl}/send-template/${templateName}`,
      emailRequest,
      { headers }
    );
  }
}
