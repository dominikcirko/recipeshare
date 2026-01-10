import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { LoginService } from './login.service';
import { User } from '../user.model';

describe('LoginService Integration Tests', () => {
  let service: LoginService;
  let httpMock: HttpTestingController;

  const mockUser: User = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    passwordHash: 'hashed-password'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LoginService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(LoginService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('Authentication Flow', () => {
    it('should complete login and store token', async () => {
      const credentials = { email: 'test@example.com', password: 'password123' };
      const loginResponse = {
        userId: 1,
        token: 'real-jwt-token',
        username: 'testuser',
        email: 'test@example.com'
      };

      service.login(credentials).subscribe();

      const req = httpMock.expectOne('/api/users/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(credentials);
      req.flush(loginResponse);

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(localStorage.getItem('auth_token')).toBe('real-jwt-token');
      expect(JSON.parse(localStorage.getItem('current_user')!)).toEqual(loginResponse);
    });

    it('should complete login-logout cycle', async () => {
      const loginResponse = {
        userId: 1,
        token: 'test-token',
        username: 'testuser',
        email: 'test@example.com'
      };

      service.login({ email: 'test@example.com', password: 'password' }).subscribe();

      const req = httpMock.expectOne('/api/users/login');
      req.flush(loginResponse);

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(service.isLoggedIn()).toBe(true);
      expect(service.getToken()).toBe('test-token');

      service.logout();

      expect(service.isLoggedIn()).toBe(false);
      expect(service.getToken()).toBeNull();
    });

    it('should persist authentication across service instances', async () => {
      const loginResponse = {
        userId: 1,
        token: 'persist-token',
        username: 'testuser',
        email: 'test@example.com'
      };

      service.login({ email: 'test@example.com', password: 'password' }).subscribe();

      const req = httpMock.expectOne('/api/users/login');
      req.flush(loginResponse);

      await new Promise(resolve => setTimeout(resolve, 0));

      const newService = TestBed.inject(LoginService);
      expect(newService.isLoggedIn()).toBe(true);
      expect(newService.getToken()).toBe('persist-token');
    });

    it('should handle login failure without storing data', async () => {
      service.login({ email: 'wrong@example.com', password: 'wrong' }).subscribe({
        error: () => {}
      });

      const req = httpMock.expectOne('/api/users/login');
      req.flush({ message: 'Invalid' }, { status: 401, statusText: 'Unauthorized' });

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(service.isLoggedIn()).toBe(false);
    });

    it('should emit user changes through observable', async () => {
      const loginResponse = {
        userId: 1,
        token: 'token',
        username: 'testuser',
        email: 'test@example.com'
      };

      const emissions: any[] = [];
      service.currentUser$.subscribe(user => emissions.push(user));

      service.login({ email: 'test@example.com', password: 'password' }).subscribe();

      const req = httpMock.expectOne('/api/users/login');
      req.flush(loginResponse);

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(emissions.length).toBeGreaterThanOrEqual(2);
      expect(emissions[0]).toBeNull();
      expect(emissions[emissions.length - 1]).toEqual(loginResponse);
    });
  });

  describe('Token Management', () => {
    it('should handle missing token', () => {
      expect(service.getToken()).toBeNull();
      expect(service.isLoggedIn()).toBe(false);
    });

    it('should handle corrupted user data', () => {
      localStorage.setItem('current_user', 'invalid{json');
      expect(() => service.getCurrentUserId()).toThrow();
    });

    it('should clear all data on logout', async () => {
      const loginResponse = {
        userId: 1,
        token: 'token',
        username: 'testuser',
        email: 'test@example.com'
      };

      service.login({ email: 'test@example.com', password: 'password' }).subscribe();

      const req = httpMock.expectOne('/api/users/login');
      req.flush(loginResponse);

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(localStorage.getItem('auth_token')).toBeTruthy();

      service.logout();

      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(localStorage.getItem('current_user')).toBeNull();
    });
  });

  describe('Error Scenarios', () => {
    it('should handle network errors', async () => {
      service.login({ email: 'test@example.com', password: 'password' }).subscribe({
        error: (err) => {
          expect(err.status).toBe(0);
        }
      });

      const req = httpMock.expectOne('/api/users/login');
      req.error(new ProgressEvent('error'), { status: 0 });

      await new Promise(resolve => setTimeout(resolve, 0));
    });

    it('should handle server errors', async () => {
      service.login({ email: 'test@example.com', password: 'password' }).subscribe({
        error: (err) => {
          expect(err.status).toBe(500);
        }
      });

      const req = httpMock.expectOne('/api/users/login');
      req.flush({ message: 'Server error' }, { status: 500, statusText: 'Internal Server Error' });

      await new Promise(resolve => setTimeout(resolve, 0));
    });
  });
});
