import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app-routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptor/auth-interceptor';
import { errorSanitizerInterceptor } from './interceptor/error-sanitizer.interceptor';
import { responseSanitizerInterceptor } from './interceptor/response-sanitizer.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor, responseSanitizerInterceptor, errorSanitizerInterceptor])
    )
  ]
};
