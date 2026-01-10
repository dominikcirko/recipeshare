import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './auth-interceptor';
import { LoginService } from '../feature/user/login-form/login.service';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let loginServiceMock: any;

  const testUrl = '/api/test';
  const mockToken = 'mock-token-123';

  beforeEach(() => {
    // Create mock LoginService
    loginServiceMock = {
      getToken: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
      isLoggedIn: vi.fn(),
      getCurrentUserId: vi.fn()
    } as any;

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: LoginService, useValue: loginServiceMock }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add Authorization header when token exists', () => {
    loginServiceMock.getToken.mockReturnValue(mockToken);

    httpClient.get(testUrl).subscribe();

    const req = httpMock.expectOne(testUrl);
    expect(req.request.headers.has('Authorization')).toBe(true);
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);

    req.flush({});
  });

  it('should not add Authorization header when token is null', () => {
    loginServiceMock.getToken.mockReturnValue(null);

    httpClient.get(testUrl).subscribe();

    const req = httpMock.expectOne(testUrl);
    expect(req.request.headers.has('Authorization')).toBe(false);

    req.flush({});
  });

  it('should not add Authorization header when token is empty string', () => {
    loginServiceMock.getToken.mockReturnValue('');

    httpClient.get(testUrl).subscribe();

    const req = httpMock.expectOne(testUrl);
    expect(req.request.headers.has('Authorization')).toBe(false);

    req.flush({});
  });

  it('should call loginService.getToken() for each request', () => {
    loginServiceMock.getToken.mockReturnValue(mockToken);

    httpClient.get(testUrl).subscribe();
    httpClient.get(testUrl).subscribe();
    httpClient.get(testUrl).subscribe();

    const requests = httpMock.match(testUrl);
    expect(requests.length).toBe(3);
    expect(loginServiceMock.getToken).toHaveBeenCalledTimes(3);

    requests.forEach(req => req.flush({}));
  });

  it('should work with POST requests', () => {
    loginServiceMock.getToken.mockReturnValue(mockToken);
    const postData = { name: 'test' };

    httpClient.post(testUrl, postData).subscribe();

    const req = httpMock.expectOne(testUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
    expect(req.request.body).toEqual(postData);

    req.flush({});
  });

  it('should work with PUT requests', () => {
    loginServiceMock.getToken.mockReturnValue(mockToken);
    const putData = { id: 1, name: 'updated' };

    httpClient.put(testUrl, putData).subscribe();

    const req = httpMock.expectOne(testUrl);
    expect(req.request.method).toBe('PUT');
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
    expect(req.request.body).toEqual(putData);

    req.flush({});
  });

  it('should work with DELETE requests', () => {
    loginServiceMock.getToken.mockReturnValue(mockToken);

    httpClient.delete(testUrl).subscribe();

    const req = httpMock.expectOne(testUrl);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);

    req.flush({});
  });

  it('should preserve existing headers when adding Authorization', () => {
    loginServiceMock.getToken.mockReturnValue(mockToken);

    httpClient.get(testUrl, {
      headers: {
        'Content-Type': 'application/json',
        'X-Custom-Header': 'custom-value'
      }
    }).subscribe();

    const req = httpMock.expectOne(testUrl);
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
    expect(req.request.headers.get('Content-Type')).toBe('application/json');
    expect(req.request.headers.get('X-Custom-Header')).toBe('custom-value');

    req.flush({});
  });

  it('should not modify original request when no token exists', () => {
    loginServiceMock.getToken.mockReturnValue(null);

    const customHeaders = {
      'Content-Type': 'application/json',
      'X-Custom-Header': 'custom-value'
    };

    httpClient.get(testUrl, { headers: customHeaders }).subscribe();

    const req = httpMock.expectOne(testUrl);
    expect(req.request.headers.has('Authorization')).toBe(false);
    expect(req.request.headers.get('Content-Type')).toBe('application/json');
    expect(req.request.headers.get('X-Custom-Header')).toBe('custom-value');

    req.flush({});
  });

  it('should handle different token formats', () => {
    const differentTokens = [
      'simple-token',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U', // JWT
      'token-with-special-chars-@#$%',
      '12345',
      'a'.repeat(1000) // Very long token
    ];

    differentTokens.forEach((token, index) => {
      loginServiceMock.getToken.mockReturnValue(token);

      httpClient.get(`${testUrl}/${index}`).subscribe();

      const req = httpMock.expectOne(`${testUrl}/${index}`);
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);

      req.flush({});
    });
  });

  it('should handle multiple simultaneous requests', () => {
    loginServiceMock.getToken.mockReturnValue(mockToken);

    const urls = ['/api/test1', '/api/test2', '/api/test3'];

    urls.forEach(url => httpClient.get(url).subscribe());

    urls.forEach(url => {
      const req = httpMock.expectOne(url);
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      req.flush({});
    });
  });

  it('should handle changing token between requests', () => {
    const token1 = 'token-1';
    const token2 = 'token-2';

    // First request with token1
    loginServiceMock.getToken.mockReturnValue(token1);
    httpClient.get('/api/test1').subscribe();
    const req1 = httpMock.expectOne('/api/test1');
    expect(req1.request.headers.get('Authorization')).toBe(`Bearer ${token1}`);
    req1.flush({});

    // Second request with token2
    loginServiceMock.getToken.mockReturnValue(token2);
    httpClient.get('/api/test2').subscribe();
    const req2 = httpMock.expectOne('/api/test2');
    expect(req2.request.headers.get('Authorization')).toBe(`Bearer ${token2}`);
    req2.flush({});

    // Third request with no token
    loginServiceMock.getToken.mockReturnValue(null);
    httpClient.get('/api/test3').subscribe();
    const req3 = httpMock.expectOne('/api/test3');
    expect(req3.request.headers.has('Authorization')).toBe(false);
    req3.flush({});
  });

  it('should work with requests that return errors', () => {
    loginServiceMock.getToken.mockReturnValue(mockToken);

    httpClient.get(testUrl).subscribe({
      next: () => expect.fail('should have failed'),
      error: (error) => {
        expect(error.status).toBe(401);
      }
    });

    const req = httpMock.expectOne(testUrl);
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
  });

  it('should not interfere with request body', () => {
    loginServiceMock.getToken.mockReturnValue(mockToken);
    const complexBody = {
      user: {
        name: 'Test User',
        email: 'test@example.com',
        preferences: {
          theme: 'dark',
          notifications: true
        }
      },
      metadata: ['tag1', 'tag2', 'tag3']
    };

    httpClient.post(testUrl, complexBody).subscribe();

    const req = httpMock.expectOne(testUrl);
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
    expect(req.request.body).toEqual(complexBody);

    req.flush({});
  });

  describe('Integration with LoginService', () => {
    it('should use real token from LoginService behavior', () => {
      // Simulate token being set
      loginServiceMock.getToken.mockReturnValue('real-auth-token');

      httpClient.get('/api/protected-resource').subscribe();

      const req = httpMock.expectOne('/api/protected-resource');
      expect(req.request.headers.get('Authorization')).toBe('Bearer real-auth-token');
      expect(loginServiceMock.getToken).toHaveBeenCalled();

      req.flush({ data: 'protected data' });
    });

    it('should handle logout scenario (token becomes null)', () => {
      // Initially logged in
      loginServiceMock.getToken.mockReturnValue(mockToken);
      httpClient.get('/api/test1').subscribe();
      let req = httpMock.expectOne('/api/test1');
      expect(req.request.headers.has('Authorization')).toBe(true);
      req.flush({});

      // After logout
      loginServiceMock.getToken.mockReturnValue(null);
      httpClient.get('/api/test2').subscribe();
      req = httpMock.expectOne('/api/test2');
      expect(req.request.headers.has('Authorization')).toBe(false);
      req.flush({});
    });
  });
});
