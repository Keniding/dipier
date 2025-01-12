import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-error-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="error-container" [ngClass]="{'pending-activation': isPendingActivation}">
      <div class="error-content">
        <div class="error-image">
          <img [src]="getErrorImage()" [alt]="isPendingActivation ? 'Activación pendiente' : 'Error ' + errorStatus">
        </div>
        <h1 *ngIf="!isPendingActivation">Error {{ errorStatus }}</h1>
        <h1 *ngIf="isPendingActivation">¡Registro exitoso!</h1>
        <p class="error-message">{{ errorMessage }}</p>
        <div class="buttons">
          <button (click)="goToHome()" class="btn-primary">
            <span class="btn-icon">{{ isPendingActivation ? '📧' : '🏠' }}</span>
            {{ getButtonText() }}
          </button>
        </div>
      </div>
    </div>
  `,

  styles: [`
    .error-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 2rem;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }

    .error-401 { background: linear-gradient(135deg, #fff1eb 0%, #ace0f9 100%); }
    .error-403 { background: linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%); }
    .error-404 { background: linear-gradient(135deg, #f6d365 0%, #fda085 100%); }
    .error-500 { background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); }

    .error-content {
      text-align: center;
      background: rgba(255, 255, 255, 0.95);
      padding: 3rem;
      border-radius: 20px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      max-width: 600px;
      width: 100%;
      backdrop-filter: blur(10px);
      animation: slideIn 0.5s ease-out;
    }

    @keyframes slideIn {
      from {
        transform: translateY(-20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .error-image {
      margin-bottom: 2rem;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .error-image img {
      max-width: 300px;
      width: 100%;
      height: auto;
      border-radius: 10px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
      animation: pulse 2s infinite;
      background: white;
      padding: 1rem;
    }

    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }

    h1 {
      color: #2d3748;
      font-size: 2.5rem;
      margin-bottom: 1rem;
      font-weight: 700;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
    }

    .error-message {
      color: #4a5568;
      margin: 1.5rem 0;
      font-size: 1.2rem;
      line-height: 1.6;
      font-weight: 500;
    }

    .buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-top: 2rem;
    }

    .btn-primary {
      padding: 1rem 2rem;
      border: none;
      border-radius: 50px;
      cursor: pointer;
      font-weight: 600;
      font-size: 1.1rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.25);
    }

    .btn-icon {
      font-size: 1.2rem;
    }

    .pending-activation {
      background: linear-gradient(135deg, #a8e6cf 0%, #1de9b6 100%);
    }

    .pending-activation .error-content {
      border: 2px solid rgba(46, 204, 113, 0.2);
    }

    .pending-activation .btn-primary {
      background: linear-gradient(135deg, #2ECC71 0%, #27AE60 100%);
    }

    .pending-activation h1 {
      color: #27AE60;
    }

    .pending-activation .error-message {
      color: #2C3E50;
      font-size: 1.1rem;
      max-width: 400px;
      margin: 1.5rem auto;
      line-height: 1.8;
    }
  `]
})
export class ErrorPageComponent implements OnInit {
  errorStatus: number | string = 0;
  errorMessage: string = '';
  private lastValidUrl: string = '/';
  isPendingActivation: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.errorStatus = params['status'] || 0;
      this.errorMessage = params['message'] || 'Ha ocurrido un error inesperado';
      this.lastValidUrl = params['returnUrl'] || '/';
      this.isPendingActivation = this.errorStatus === 'pending';
    });
  }

  getErrorImage(): string {
    const errorImages: { [key: string | number]: string } = {
      401: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#4A90E2;stop-opacity:0.2"/>
            <stop offset="100%" style="stop-color:#4A90E2;stop-opacity:0.1"/>
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#grad1)"/>
        <circle cx="200" cy="120" r="50" fill="#4A90E2" opacity="0.9"/>
        <path d="M200 80 L200 160 M180 120 L220 120" stroke="white" stroke-width="8"/>
        <rect x="160" y="180" width="80" height="60" rx="10" fill="#4A90E2"/>
        <circle cx="200" cy="210" r="5" fill="white"/>
        <text x="200" y="270" font-family="Arial" font-size="24" fill="#2C3E50" text-anchor="middle" font-weight="bold">No autorizado</text>
      </svg>
    `)}`,
      403: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
        <defs>
          <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#E74C3C;stop-opacity:0.2"/>
            <stop offset="100%" style="stop-color:#E74C3C;stop-opacity:0.1"/>
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#grad2)"/>
        <circle cx="200" cy="120" r="50" fill="#E74C3C" opacity="0.9"/>
        <path d="M170 90 L230 150 M230 90 L170 150" stroke="white" stroke-width="8"/>
        <path d="M150 180 h100 v60 h-100 z" fill="#E74C3C" rx="10"/>
        <text x="200" y="270" font-family="Arial" font-size="24" fill="#2C3E50" text-anchor="middle" font-weight="bold">Acceso denegado</text>
      </svg>
    `)}`,
      404: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
        <defs>
          <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#F1C40F;stop-opacity:0.2"/>
            <stop offset="100%" style="stop-color:#F1C40F;stop-opacity:0.1"/>
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#grad3)"/>
        <path d="M150 100 h100 v100 h-100 z M160 110 h80 v80 h-80 z" fill="#F1C40F"/>
        <text x="200" y="160" font-family="Arial" font-size="60" fill="#2C3E50" text-anchor="middle">404</text>
        <text x="200" y="270" font-family="Arial" font-size="24" fill="#2C3E50" text-anchor="middle" font-weight="bold">Página no encontrada</text>
      </svg>
    `)}`,
      500: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
        <defs>
          <linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#9B59B6;stop-opacity:0.2"/>
            <stop offset="100%" style="stop-color:#9B59B6;stop-opacity:0.1"/>
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#grad4)"/>
        <path d="M175 100 l25 -20 l25 20 l-25 20 z" fill="#9B59B6"/>
        <circle cx="200" cy="150" r="30" fill="#9B59B6"/>
        <path d="M170 180 q30 30 60 0" stroke="#9B59B6" stroke-width="8" fill="none"/>
        <text x="200" y="270" font-family="Arial" font-size="24" fill="#2C3E50" text-anchor="middle" font-weight="bold">Error del servidor</text>
      </svg>
    `)}`,
      0: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
        <defs>
          <linearGradient id="grad5" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#95A5A6;stop-opacity:0.2"/>
            <stop offset="100%" style="stop-color:#95A5A6;stop-opacity:0.1"/>
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#grad5)"/>
        <circle cx="200" cy="120" r="50" fill="#95A5A6" opacity="0.9"/>
        <text x="200" y="135" font-family="Arial" font-size="60" fill="white" text-anchor="middle">?</text>
        <text x="200" y="270" font-family="Arial" font-size="24" fill="#2C3E50" text-anchor="middle" font-weight="bold">Error desconocido</text>
      </svg>
    `)}`,
      'pending': `data:image/svg+xml;base64,${btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
        <circle cx="200" cy="150" r="60" fill="#2ECC71"/><path d="M170 150 L190 170 L230 130" stroke="white" stroke-width="8" fill="none"/>
        </svg>
      `)}`,
    };

    return errorImages[this.errorStatus] || errorImages[0];
  }

  getButtonText(): string {
    return this.isPendingActivation ? 'Ir al login' : 'Ir al inicio';
  }

  goToHome() {
    this.router.navigate([this.lastValidUrl]);
  }
}
