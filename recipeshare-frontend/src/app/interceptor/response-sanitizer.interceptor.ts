import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { sanitizeObject } from '../core/sanitize.util';

/**
 * Interceptor that sanitizes all JSON response bodies to strip HTML tags
 * This prevents XSS attacks from malicious data stored in the backend
 */
export const responseSanitizerInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    map(event => {
      if (event instanceof HttpResponse && event.body) {
        const contentType = event.headers.get('Content-Type') || '';
        // Only sanitize JSON responses
        if (contentType.includes('application/json') || typeof event.body === 'object') {
          return event.clone({
            body: sanitizeObject(event.body)
          });
        }
      }
      return event;
    })
  );
};
