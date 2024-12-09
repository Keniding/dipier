import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';
import {provideHttpClient, withFetch} from "@angular/common/http";
import {provideAnimationsAsync} from "@angular/platform-browser/animations/async";

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    //provideAnimationsAsync(),
    provideHttpClient(withFetch())
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
