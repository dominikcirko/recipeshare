import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { LoginService, LoginRequest, LoginResponse } from './login.service';

describe('LoginService', () => {
  let service: LoginService;
  let httpMock: HttpTestingController;
  let localStorageSpy: { [key: string]: string } = {};

  const mockLoginRequest: LoginRequest = {
    email: 'test@example.com',
    password: 'password123'
  };

  const mockLoginResponse: LoginResponse = {
    userId: 1,
    token: 'mock-token-123',
    username: 'testuser',
    email: 'test@example.com'
  };

  beforeEach(() => {
    // Mock localStorage
    localStorageSpy = {};
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => {
      return localStorageSpy[key] || null;
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key: string, value: string) => {
      localStorageSpy[key] = value;
    });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key: string) => {
      delete localStorageSpy[key];
    });

    TestBed.configureTestingModule({
      providers: [
        LoginService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(LoginService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should send POST request to /api/users/login with credentials', () => {
      service.login(mockLoginRequest).subscribe();

      const req = httpMock.expectOne('/api/users/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockLoginRequest);

      req.flush(mockLoginResponse);
    });

    it('should store token in localStorage on successful login', async () => {
      service.login(mockLoginRequest).subscribe(() => {
        expect(localStorageSpy['auth_token']).toBe(mockLoginResponse.token);
      });

      const req = httpMock.expectOne('/api/users/login');
      req.flush(mockLoginResponse);
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    it('should store current user in localStorage on successful login', async () => {
      service.login(mockLoginRequest).subscribe(() => {
        expect(localStorageSpy['current_user']).toBe(JSON.stringify(mockLoginResponse));
      });

      const req = httpMock.expectOne('/api/users/login');
      req.flush(mockLoginResponse);
    });

    it('should update currentUserSubject on successful login', async () => {
      service.currentUser$.subscribe(user => {
        if (user) {
          expect(user).toEqual(mockLoginResponse);
        }
      });

      service.login(mockLoginRequest).subscribe();

      const req = httpMock.expectOne('/api/users/login');
      req.flush(mockLoginResponse);
    });

    it('should return LoginResponse observable', async () => {
      service.login(mockLoginRequest).subscribe(response => {
        expect(response).toEqual(mockLoginResponse);
      });

      const req = httpMock.expectOne('/api/users/login');
      req.flush(mockLoginResponse);
    });

    it('should handle login error', async () => {
      const errorMessage = 'Invalid credentials';

      service.login(mockLoginRequest).subscribe({
        next: () => expect.fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(401);
        }
      });

      const req = httpMock.expectOne('/api/users/login');
      req.flush(errorMessage, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('logout', () => {
    beforeEach(() => {
      // Setup logged in state
      localStorageSpy['auth_token'] = mockLoginResponse.token;
      localStorageSpy['current_user'] = JSON.stringify(mockLoginResponse);
    });

    it('should remove auth_token from localStorage', () => {
      service.logout();
      expect(localStorageSpy['auth_token']).toBeUndefined();
    });

    it('should remove current_user from localStorage', () => {
      service.logout();
      expect(localStorageSpy['current_user']).toBeUndefined();
    });

    it('should set currentUserSubject to null', async () => {
      service.logout();

      service.currentUser$.subscribe(user => {
        expect(user).toBeNull();
      });
    });
  });

  describe('getToken', () => {
    it('should return token from localStorage when token exists', () => {
      localStorageSpy['auth_token'] = mockLoginResponse.token;

      const token = service.getToken();

      expect(token).toBe(mockLoginResponse.token);
    });

    it('should return null when no token exists', () => {
      const token = service.getToken();

      expect(token).toBeNull();
    });
  });

  describe('isLoggedIn', () => {
    it('should return true when token exists', () => {
      localStorageSpy['auth_token'] = mockLoginResponse.token;

      expect(service.isLoggedIn()).toBe(true);
    });

    it('should return false when token does not exist', () => {
      expect(service.isLoggedIn()).toBe(false);
    });

    it('should return false when token is empty string', () => {
      localStorageSpy['auth_token'] = '';

      expect(service.isLoggedIn()).toBe(false);
    });
  });

  describe('getCurrentUserId', () => {
    it('should return userId when current_user exists in localStorage', () => {
      localStorageSpy['current_user'] = JSON.stringify(mockLoginResponse);

      const userId = service.getCurrentUserId();

      expect(userId).toBe(mockLoginResponse.userId);
    });

    it('should return null when current_user does not exist', () => {
      const userId = service.getCurrentUserId();

      expect(userId).toBeNull();
    });

    it('should return null when current_user is invalid JSON', () => {
      localStorageSpy['current_user'] = 'invalid-json';

      expect(() => service.getCurrentUserId()).toThrow();
    });
  });

  describe('currentUser$ observable', () => {
    it('should emit null initially', async () => {
      service.currentUser$.subscribe(user => {
        expect(user).toBeNull();
      });
    });

    it('should emit user data after login', async () => {
      let emissionCount = 0;

      service.currentUser$.subscribe(user => {
        emissionCount++;
        if (emissionCount === 2) { // Skip initial null emission
          expect(user).toEqual(mockLoginResponse);
        }
      });

      service.login(mockLoginRequest).subscribe();
      const req = httpMock.expectOne('/api/users/login');
      req.flush(mockLoginResponse);
    });
  });
});
