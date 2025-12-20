import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoginService } from '../feature/user/login-form/login.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(LoginService);
  const token = authService.getToken();
  
  if (token) {
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(cloned);
  }
  
  return next(req);
};