import { ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import {HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptors} from "@angular/common/http";
import {provideClientHydration} from "@angular/platform-browser";
import {provideAnimations} from "@angular/platform-browser/animations";
import {provideRouter} from "@angular/router";
import {routes} from "./app.routes";
import {AuthInterceptor} from "./login/auth/auth-interceptor.service";
import { errorInterceptor } from './interceptors/http-error.interceptor';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    //provideAnimationsAsync(),
    provideHttpClient(withFetch())
  ]
};

export const config: ApplicationConfig = {
  providers: [
    provideClientHydration(),
    provideAnimations(),
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withInterceptors([errorInterceptor])
    ),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ]
};
