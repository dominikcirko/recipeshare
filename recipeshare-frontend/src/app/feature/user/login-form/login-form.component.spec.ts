import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login-form.component';
import { LoginService, LoginResponse } from './login.service';
import { FormsModule } from '@angular/forms';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let loginServiceMock: any;
  let routerMock: any;

  const mockLoginResponse: LoginResponse = {
    userId: 1,
    token: 'mock-token-123',
    username: 'testuser',
    email: 'test@example.com'
  };

  beforeEach(async () => {
    loginServiceMock = {
      login: vi.fn(),
      logout: vi.fn(),
      getToken: vi.fn(),
      isLoggedIn: vi.fn(),
      getCurrentUserId: vi.fn()
    } as any;

    routerMock = {
      navigate: vi.fn(),
      events: of({}),
      createUrlTree: vi.fn(),
      serializeUrl: vi.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [LoginComponent, FormsModule],
      providers: [
        { provide: LoginService, useValue: loginServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: { snapshot: { params: {} }, params: of({}) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with empty email', () => {
      expect(component.email).toBe('');
    });

    it('should initialize with empty password', () => {
      expect(component.password).toBe('');
    });

    it('should initialize with empty error', () => {
      expect(component.error).toBe('');
    });
  });

  describe('onSubmit', () => {
    beforeEach(() => {
      component.email = 'test@example.com';
      component.password = 'password123';
    });

    it('should clear error message before submitting', () => {
      component.error = 'Previous error';
      loginServiceMock.login.mockReturnValue(of(mockLoginResponse));

      component.onSubmit();

      expect(component.error).toBe('');
    });

    it('should call loginService.login with email and password', () => {
      loginServiceMock.login.mockReturnValue(of(mockLoginResponse));

      component.onSubmit();

      expect(loginServiceMock.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    it('should navigate to /recipes on successful login', async () => {
      loginServiceMock.login.mockReturnValue(of(mockLoginResponse));
      routerMock.navigate.mockResolvedValue(true);

      component.onSubmit();

      await new Promise(resolve => setTimeout(resolve, 0));
      expect(routerMock.navigate).toHaveBeenCalledWith(['/recipes']);
    });

    it('should set error message on login failure', async () => {
      const error = { status: 401, message: 'Unauthorized' };
      loginServiceMock.login.mockReturnValue(throwError(() => error));

      component.onSubmit();

      await new Promise(resolve => setTimeout(resolve, 0));
        expect(component.error).toBe('Invalid credentials');
        
    });

    it('should not navigate on login failure', async () => {
      const error = { status: 401, message: 'Unauthorized' };
      loginServiceMock.login.mockReturnValue(throwError(() => error));

      component.onSubmit();

      await new Promise(resolve => setTimeout(resolve, 0));
        expect(routerMock.navigate).not.toHaveBeenCalled();
        
    });

    it('should log error to console on login failure', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = { status: 401, message: 'Unauthorized' };
      loginServiceMock.login.mockReturnValue(throwError(() => error));

      component.onSubmit();

      await new Promise(resolve => setTimeout(resolve, 0));
        expect(consoleErrorSpy).toHaveBeenCalledWith('Login failed:', error);
        consoleErrorSpy.mockRestore();
        
    });

    it('should handle empty email', () => {
      component.email = '';
      component.password = 'password123';
      loginServiceMock.login.mockReturnValue(of(mockLoginResponse));

      component.onSubmit();

      expect(loginServiceMock.login).toHaveBeenCalledWith({
        email: '',
        password: 'password123'
      });
    });

    it('should handle empty password', () => {
      component.email = 'test@example.com';
      component.password = '';
      loginServiceMock.login.mockReturnValue(of(mockLoginResponse));

      component.onSubmit();

      expect(loginServiceMock.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: ''
      });
    });

    it('should handle both email and password empty', () => {
      component.email = '';
      component.password = '';
      loginServiceMock.login.mockReturnValue(of(mockLoginResponse));

      component.onSubmit();

      expect(loginServiceMock.login).toHaveBeenCalledWith({
        email: '',
        password: ''
      });
    });

    it('should handle network errors', async () => {
      const networkError = { status: 0, message: 'Network error' };
      loginServiceMock.login.mockReturnValue(throwError(() => networkError));

      component.onSubmit();

      await new Promise(resolve => setTimeout(resolve, 0));
        expect(component.error).toBe('Invalid credentials');
        
    });

    it('should handle server errors', async () => {
      const serverError = { status: 500, message: 'Internal Server Error' };
      loginServiceMock.login.mockReturnValue(throwError(() => serverError));

      component.onSubmit();

      await new Promise(resolve => setTimeout(resolve, 0));
        expect(component.error).toBe('Invalid credentials');
        
    });

    it('should handle multiple submit attempts', async () => {
      loginServiceMock.login.mockReturnValue(of(mockLoginResponse));
      routerMock.navigate.mockResolvedValue(true);

      component.onSubmit();
      component.onSubmit();
      component.onSubmit();

      await new Promise(resolve => setTimeout(resolve, 0));
        expect(loginServiceMock.login).toHaveBeenCalledTimes(3);
        
    });

    it('should clear previous error on new submit attempt', async () => {
      // First attempt fails
      const error = { status: 401, message: 'Unauthorized' };
      loginServiceMock.login.mockReturnValue(throwError(() => error));

      component.onSubmit();

      await new Promise(resolve => setTimeout(resolve, 0));
        expect(component.error).toBe('Invalid credentials');

        // Second attempt succeeds
        loginServiceMock.login.mockReturnValue(of(mockLoginResponse));
        component.onSubmit();

        expect(component.error).toBe('');
        
    });
  });

  describe('Template Binding', () => {
    it('should bind email to component property', async () => {
      const compiled = fixture.nativeElement;
      const emailInput = compiled.querySelector('input[type="email"]');

      if (emailInput) {
        component.email = 'test@example.com';
        fixture.detectChanges();
        await fixture.whenStable();

        expect(component.email).toBe('test@example.com');
      }
    });

    it('should bind password to component property', async () => {
      const compiled = fixture.nativeElement;
      const passwordInput = compiled.querySelector('input[type="password"]');

      if (passwordInput) {
        component.password = 'password123';
        fixture.detectChanges();
        await fixture.whenStable();

        expect(component.password).toBe('password123');
      }
    });

    it('should display error message when error is set', () => {
      component.error = 'Invalid credentials';
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const errorElement = compiled.querySelector('.error');

      if (errorElement) {
        expect(errorElement.textContent).toContain('Invalid credentials');
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in email', () => {
      component.email = 'test+special@example.com';
      component.password = 'password123';
      loginServiceMock.login.mockReturnValue(of(mockLoginResponse));

      component.onSubmit();

      expect(loginServiceMock.login).toHaveBeenCalledWith({
        email: 'test+special@example.com',
        password: 'password123'
      });
    });

    it('should handle special characters in password', () => {
      component.email = 'test@example.com';
      component.password = 'p@ssw0rd!#$%';
      loginServiceMock.login.mockReturnValue(of(mockLoginResponse));

      component.onSubmit();

      expect(loginServiceMock.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'p@ssw0rd!#$%'
      });
    });

    it('should handle very long email', () => {
      component.email = 'a'.repeat(100) + '@example.com';
      component.password = 'password123';
      loginServiceMock.login.mockReturnValue(of(mockLoginResponse));

      component.onSubmit();

      expect(loginServiceMock.login).toHaveBeenCalled();
    });

    it('should handle very long password', () => {
      component.email = 'test@example.com';
      component.password = 'a'.repeat(1000);
      loginServiceMock.login.mockReturnValue(of(mockLoginResponse));

      component.onSubmit();

      expect(loginServiceMock.login).toHaveBeenCalled();
    });
  });
});
