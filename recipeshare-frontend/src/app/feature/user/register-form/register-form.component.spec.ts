import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { RegisterComponent } from './register-form.component';
import { UserService } from '../user.service';
import { User } from '../user.model';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let userServiceMock: any;
  let routerMock: any;

  const mockUser: User = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    bio: '',
    avatarUrl: ''
  };

  beforeEach(async () => {
    userServiceMock = {
      create: vi.fn(),
      getById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    } as any;

    routerMock = {
      navigate: vi.fn(),
      events: of({}),
      createUrlTree: vi.fn(),
      serializeUrl: vi.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, ReactiveFormsModule],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: { snapshot: { params: {} }, params: of({}) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with isSubmitting as false', () => {
      expect(component.isSubmitting).toBe(false);
    });

    it('should initialize with empty errorMessage', () => {
      expect(component.errorMessage).toBe('');
    });

    it('should create registerForm on ngOnInit', () => {
      expect(component.registerForm).toBeDefined();
    });

    it('should have username control in registerForm', () => {
      expect(component.registerForm.get('username')).toBeDefined();
    });

    it('should have email control in registerForm', () => {
      expect(component.registerForm.get('email')).toBeDefined();
    });

    it('should have passwordHash control in registerForm', () => {
      expect(component.registerForm.get('passwordHash')).toBeDefined();
    });
  });

  describe('Form Validators', () => {
    it('should make username required', () => {
      const usernameControl = component.registerForm.get('username');
      usernameControl?.setValue('');

      expect(usernameControl?.hasError('required')).toBe(true);
    });

    it('should make email required', () => {
      const emailControl = component.registerForm.get('email');
      emailControl?.setValue('');

      expect(emailControl?.hasError('required')).toBe(true);
    });

    it('should validate email format', () => {
      const emailControl = component.registerForm.get('email');
      emailControl?.setValue('invalid-email');

      expect(emailControl?.hasError('email')).toBe(true);
    });

    it('should accept valid email format', () => {
      const emailControl = component.registerForm.get('email');
      emailControl?.setValue('test@example.com');

      expect(emailControl?.hasError('email')).toBe(false);
    });

    it('should make passwordHash required', () => {
      const passwordControl = component.registerForm.get('passwordHash');
      passwordControl?.setValue('');

      expect(passwordControl?.hasError('required')).toBe(true);
    });

    it('should mark form as invalid when all fields are empty', () => {
      expect(component.registerForm.valid).toBe(false);
    });

    it('should mark form as valid when all fields are filled correctly', () => {
      component.registerForm.patchValue({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'password123'
      });

      expect(component.registerForm.valid).toBe(true);
    });
  });

  describe('Form Controls Getter', () => {
    it('should return form controls', () => {
      const controls = component.f;

      expect(controls['username']).toBeDefined();
      expect(controls['email']).toBeDefined();
      expect(controls['passwordHash']).toBeDefined();
    });

    it('should provide access to control values', () => {
      component.registerForm.patchValue({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'password123'
      });

      expect(component.f['username'].value).toBe('testuser');
      expect(component.f['email'].value).toBe('test@example.com');
      expect(component.f['passwordHash'].value).toBe('password123');
    });
  });

  describe('onSubmit', () => {
    beforeEach(() => {
      component.registerForm.patchValue({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'password123'
      });
    });

    it('should not submit when form is invalid', () => {
      component.registerForm.patchValue({
        username: '',
        email: '',
        passwordHash: ''
      });

      component.onSubmit();

      expect(userServiceMock.create).not.toHaveBeenCalled();
    });

    it('should mark all fields as touched when form is invalid', () => {
      component.registerForm.patchValue({
        username: '',
        email: '',
        passwordHash: ''
      });

      component.onSubmit();

      expect(component.registerForm.get('username')?.touched).toBe(true);
      expect(component.registerForm.get('email')?.touched).toBe(true);
      expect(component.registerForm.get('passwordHash')?.touched).toBe(true);
    });

    it('should set isSubmitting to true on submit', () => {
      userServiceMock.create.mockReturnValue(of(mockUser));

      component.onSubmit();

      expect(component.isSubmitting).toBe(true);
    });

    it('should clear errorMessage on submit', () => {
      component.errorMessage = 'Previous error';
      userServiceMock.create.mockReturnValue(of(mockUser));

      component.onSubmit();

      expect(component.errorMessage).toBe('');
    });

    it('should call userService.create with form data and empty bio and avatarUrl', () => {
      userServiceMock.create.mockReturnValue(of(mockUser));

      component.onSubmit();

      expect(userServiceMock.create).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'password123',
        bio: '',
        avatarUrl: ''
      });
    });

    it('should navigate to /login on successful registration', async () => {
      userServiceMock.create.mockReturnValue(of(mockUser));
      routerMock.navigate.mockResolvedValue(true);

      component.onSubmit();

      await new Promise(resolve => setTimeout(resolve, 0));
        expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
        
    });

    it('should set isSubmitting to false on error', async () => {
      const error = { error: { message: 'Email already exists' } };
      userServiceMock.create.mockReturnValue(throwError(() => error));

      component.onSubmit();

      await new Promise(resolve => setTimeout(resolve, 0));
        expect(component.isSubmitting).toBe(false);
        
    });

    it('should set errorMessage from server error on failure', async () => {
      const error = { error: { message: 'Email already exists' } };
      userServiceMock.create.mockReturnValue(throwError(() => error));

      component.onSubmit();

      await new Promise(resolve => setTimeout(resolve, 0));
        expect(component.errorMessage).toBe('Email already exists');
        
    });

    it('should set default errorMessage when server error has no message', async () => {
      const error = { error: {} };
      userServiceMock.create.mockReturnValue(throwError(() => error));

      component.onSubmit();

      await new Promise(resolve => setTimeout(resolve, 0));
        expect(component.errorMessage).toBe('Registration failed. Please try again.');
        
    });

    it('should not navigate on registration failure', async () => {
      const error = { error: { message: 'Email already exists' } };
      userServiceMock.create.mockReturnValue(throwError(() => error));

      component.onSubmit();

      await new Promise(resolve => setTimeout(resolve, 0));
        expect(routerMock.navigate).not.toHaveBeenCalled();
        
    });

    it('should handle network errors', async () => {
      const networkError = { status: 0, message: 'Network error' };
      userServiceMock.create.mockReturnValue(throwError(() => networkError));

      component.onSubmit();

      await new Promise(resolve => setTimeout(resolve, 0));
        expect(component.errorMessage).toBe('Registration failed. Please try again.');
        expect(component.isSubmitting).toBe(false);
        
    });

    it('should handle server errors', async () => {
      const serverError = { status: 500, error: { message: 'Internal Server Error' } };
      userServiceMock.create.mockReturnValue(throwError(() => serverError));

      component.onSubmit();

      await new Promise(resolve => setTimeout(resolve, 0));
        expect(component.errorMessage).toBe('Internal Server Error');
        expect(component.isSubmitting).toBe(false);
        
    });
  });

  describe('Form Validation Integration', () => {
    it('should prevent submit with only username filled', () => {
      component.registerForm.patchValue({
        username: 'testuser',
        email: '',
        passwordHash: ''
      });

      component.onSubmit();

      expect(userServiceMock.create).not.toHaveBeenCalled();
    });

    it('should prevent submit with only email filled', () => {
      component.registerForm.patchValue({
        username: '',
        email: 'test@example.com',
        passwordHash: ''
      });

      component.onSubmit();

      expect(userServiceMock.create).not.toHaveBeenCalled();
    });

    it('should prevent submit with only password filled', () => {
      component.registerForm.patchValue({
        username: '',
        email: '',
        passwordHash: 'password123'
      });

      component.onSubmit();

      expect(userServiceMock.create).not.toHaveBeenCalled();
    });

    it('should prevent submit with invalid email format', () => {
      component.registerForm.patchValue({
        username: 'testuser',
        email: 'invalid-email',
        passwordHash: 'password123'
      });

      component.onSubmit();

      expect(userServiceMock.create).not.toHaveBeenCalled();
    });

    it('should allow submit with all valid fields', () => {
      component.registerForm.patchValue({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'password123'
      });

      userServiceMock.create.mockReturnValue(of(mockUser));

      component.onSubmit();

      expect(userServiceMock.create).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in username', () => {
      component.registerForm.patchValue({
        username: 'test_user-123',
        email: 'test@example.com',
        passwordHash: 'password123'
      });

      userServiceMock.create.mockReturnValue(of(mockUser));

      component.onSubmit();

      expect(userServiceMock.create).toHaveBeenCalledWith(
        expect.objectContaining({ username: 'test_user-123' })
      );
    });

    it('should handle special characters in email', () => {
      component.registerForm.patchValue({
        username: 'testuser',
        email: 'test+special@example.com',
        passwordHash: 'password123'
      });

      userServiceMock.create.mockReturnValue(of(mockUser));

      component.onSubmit();

      expect(userServiceMock.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'test+special@example.com' })
      );
    });

    it('should handle special characters in password', () => {
      component.registerForm.patchValue({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'p@ssw0rd!#$%'
      });

      userServiceMock.create.mockReturnValue(of(mockUser));

      component.onSubmit();

      expect(userServiceMock.create).toHaveBeenCalledWith(
        expect.objectContaining({ passwordHash: 'p@ssw0rd!#$%' })
      );
    });

    it('should handle very long username', () => {
      const longUsername = 'a'.repeat(100);
      component.registerForm.patchValue({
        username: longUsername,
        email: 'test@example.com',
        passwordHash: 'password123'
      });

      userServiceMock.create.mockReturnValue(of(mockUser));

      component.onSubmit();

      expect(userServiceMock.create).toHaveBeenCalledWith(
        expect.objectContaining({ username: longUsername })
      );
    });

    it('should handle whitespace in inputs', () => {
      component.registerForm.patchValue({
        username: '  testuser  ',
        email: '  test@example.com  ',
        passwordHash: '  password123  '
      });

      userServiceMock.create.mockReturnValue(of(mockUser));

      component.onSubmit();

      // Email validator will fail with whitespace, so form won't submit
      expect(userServiceMock.create).not.toHaveBeenCalled();
    });
  });

  describe('State Management', () => {
    it('should maintain isSubmitting state through successful submission', async () => {
      userServiceMock.create.mockReturnValue(of(mockUser));
      routerMock.navigate.mockResolvedValue(true);

      component.registerForm.patchValue({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'password123'
      });

      expect(component.isSubmitting).toBe(false);
      component.onSubmit();
      expect(component.isSubmitting).toBe(true);

      await new Promise(resolve => setTimeout(resolve, 0));
        // isSubmitting stays true after success (no reset in code)
        
    });

    it('should reset isSubmitting after error', async () => {
      const error = { error: { message: 'Error occurred' } };
      userServiceMock.create.mockReturnValue(throwError(() => error));

      component.registerForm.patchValue({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'password123'
      });

      component.onSubmit();

      await new Promise(resolve => setTimeout(resolve, 0));
        expect(component.isSubmitting).toBe(false);
        
    });
  });
});
