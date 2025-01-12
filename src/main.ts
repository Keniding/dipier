import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { routes } from './app/app.routes';
import {
  HttpErrorResponse,
  HttpInterceptorFn,
  provideHttpClient,
  withFetch,
  withInterceptors
} from "@angular/common/http";
import './app/chart.config';
import { throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { Injectable, inject } from "@angular/core";
import { ErrorService } from "./app/login/auth/error.service";

@Injectable({providedIn: 'root'})
class ErrorInterceptorService {
  private errorService = inject(ErrorService);
  private router = inject(Router);

  intercept: HttpInterceptorFn = (req, next) => {
    return next(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = '';
        let statusCode = error.status;

        if (error.error instanceof ErrorEvent) {
          errorMessage = error.error.message;
        } else {
          errorMessage = error.error?.error || 'Ha ocurrido un error';
        }

        switch (statusCode) {
          case 401:
            this.router.navigate(['/error'], {
              queryParams: {
                status: statusCode,
                message: 'No autorizado. Por favor, inicie sesión.'
              }
            });
            break;
          case 403:
            this.router.navigate(['/error'], {
              queryParams: {
                status: statusCode,
                message: 'Acceso denegado. No tiene permisos suficientes.'
              }
            });
            break;
          case 404:
            this.router.navigate(['/error'], {
              queryParams: {
                status: statusCode,
                message: 'Recurso no encontrado.'
              }
            });
            break;
          case 500:
            this.router.navigate(['/error'], {
              queryParams: {
                status: statusCode,
                message: 'Error interno del servidor.'
              }
            });
            break;
          default:
            this.router.navigate(['/error'], {
              queryParams: {
                status: statusCode,
                message: errorMessage
              }
            });
        }

        this.errorService.showError(errorMessage, statusCode);
        return throwError(() => error);
      })
    );
  };
}

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withInterceptors([(req, next) => {
        return inject(ErrorInterceptorService).intercept(req, next);
      }])
    )
  ]
}).catch(err => console.error(err));
