import { Component } from '@angular/core';
import {fadeAnimation} from "../../../../../animations";
import {ErrorService} from "../../../login/auth/error.service";
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-error-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="errorService.errorState$ | async as error">
      <div *ngIf="error.show"
           class="error-container"
           [@fadeAnimation]>
        <div class="error-content">
          <div class="error-icon">
            ⚠️
          </div>
          <div class="error-message">
            <h3>{{ getErrorTitle(error.status) }}</h3>
            <p>{{ error.message }}</p>
          </div>
          <button class="close-button" (click)="errorService.hideError()">
            ✕
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .error-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
      min-width: 300px;
      max-width: 400px;
    }

    .error-content {
      display: flex;
      align-items: center;
      background: white;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border-left: 4px solid #dc3545;
    }

    .error-icon {
      font-size: 24px;
      margin-right: 16px;
    }

    .error-message {
      flex: 1;
    }

    .error-message h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #dc3545;
    }

    .error-message p {
      margin: 4px 0 0;
      font-size: 14px;
      color: #666;
    }

    .close-button {
      background: none;
      border: none;
      color: #999;
      cursor: pointer;
      padding: 4px;
      font-size: 16px;
      transition: color 0.2s;
    }

    .close-button:hover {
      color: #666;
    }
  `],
  animations: [fadeAnimation]
})
export class ErrorDisplayComponent {
  constructor(public errorService: ErrorService) {}

  getErrorTitle(status?: number): string {
    switch (status) {
      case 403:
        return 'Acceso Denegado';
      case 401:
        return 'No Autorizado';
      default:
        return 'Error';
    }
  }
}
