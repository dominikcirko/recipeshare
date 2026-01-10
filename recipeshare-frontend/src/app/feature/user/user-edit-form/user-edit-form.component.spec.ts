import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { UserEditFormComponent } from './user-edit-form.component';
import { UserService } from '../user.service';
import { User } from '../user.model';

describe('UserEditFormComponent', () => {
  let component: UserEditFormComponent;
  let fixture: ComponentFixture<UserEditFormComponent>;
  let userServiceMock: any;
  let routerMock: any;
  let activatedRouteMock: any;

  const mockUser: User = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    bio: 'Test bio',
    avatarUrl: 'https://example.com/avatar.jpg',
    passwordHash: 'hashed-password'
  };

  beforeEach(async () => {
    userServiceMock = {
      create: vi.fn(),
      getById: vi.fn().mockReturnValue(of(mockUser)),
      update: vi.fn(),
      delete: vi.fn()
    } as any;

    routerMock = {
      navigate: vi.fn()
    } as any;

    activatedRouteMock = {
      params: of({ id: '1' })
    };

    await TestBed.configureTestingModule({
      imports: [UserEditFormComponent, ReactiveFormsModule],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserEditFormComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with null userId', () => {
      expect(component.userId).toBeNull();
    });

    it('should initialize with isLoading as true', () => {
      expect(component.isLoading).toBe(true);
    });

    it('should initialize with null error', () => {
      expect(component.error).toBeNull();
    });

    it('should initialize with null successMessage', () => {
      expect(component.successMessage).toBeNull();
    });

    it('should initialize with empty currentPasswordHash', () => {
      expect(component.currentPasswordHash).toBe('');
    });

    it('should create userForm in constructor', () => {
      expect(component.userForm).toBeDefined();
    });

    it('should have email control with required and email validators', () => {
      const emailControl = component.userForm.get('email');
      emailControl?.setValue('');

      expect(emailControl?.hasError('required')).toBe(true);

      emailControl?.setValue('invalid-email');
      expect(emailControl?.hasError('email')).toBe(true);

      emailControl?.setValue('test@example.com');
      expect(emailControl?.hasError('email')).toBe(false);
    });

    it('should have bio control without validators', () => {
      const bioControl = component.userForm.get('bio');
      bioControl?.setValue('');

      expect(bioControl?.valid).toBe(true);
    });

    it('should have avatarUrl control without validators', () => {
      const avatarUrlControl = component.userForm.get('avatarUrl');
      avatarUrlControl?.setValue('');

      expect(avatarUrlControl?.valid).toBe(true);
    });
  });

  describe('ngOnInit', () => {
    it('should extract userId from route params', () => {
      userServiceMock.getById.mockReturnValue(of(mockUser));

      fixture.detectChanges(); // Trigger ngOnInit

      expect(component.userId).toBe(1);
    });

    it('should call loadUser when userId is provided', () => {
      userServiceMock.getById.mockReturnValue(of(mockUser));
      const loadUserSpy = vi.spyOn(component, 'loadUser');

      fixture.detectChanges(); // Trigger ngOnInit

      expect(loadUserSpy).toHaveBeenCalled();
    });

    it('should not call loadUser when userId is 0', () => {
      activatedRouteMock.params = of({ id: '0' });
      const loadUserSpy = vi.spyOn(component, 'loadUser');

      fixture.detectChanges(); // Trigger ngOnInit

      expect(loadUserSpy).not.toHaveBeenCalled();
    });

    it('should handle non-numeric id param', () => {
      activatedRouteMock.params = of({ id: 'invalid' });
      userServiceMock.getById.mockReturnValue(of(mockUser));

      fixture.detectChanges(); // Trigger ngOnInit

      expect(component.userId).toBeNaN();
    });
  });

  describe('loadUser', () => {
    beforeEach(() => {
      component.userId = 1;
    });

    it('should set error when userId is null', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      component.userId = null;

      component.loadUser();

      expect(component.error).toBe('No user ID provided');
      expect(component.isLoading).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('No user ID provided');
      consoleErrorSpy.mockRestore();
    });

    it('should call userService.getById with userId', () => {
      userServiceMock.getById.mockReturnValue(of(mockUser));

      component.loadUser();

      expect(userServiceMock.getById).toHaveBeenCalledWith(1);
    });

    it('should patch form with user data on success', async () => {
      userServiceMock.getById.mockReturnValue(of(mockUser));

      component.loadUser();

      await new Promise(resolve => setTimeout(resolve, 0));
        expect(component.userForm.value.username).toBe(mockUser.username);
        expect(component.userForm.value.email).toBe(mockUser.email);
        expect(component.userForm.value.bio).toBe(mockUser.bio);
        expect(component.userForm.value.avatarUrl).toBe(mockUser.avatarUrl);
        
    });

    it('should store currentPasswordHash on success', async () => {
      userServiceMock.getById.mockReturnValue(of(mockUser));

      component.loadUser();

      await new Promise(resolve => setTimeout(resolve, 0));
        expect(component.currentPasswordHash).toBe(mockUser.passwordHash);
        
    });

    it('should set isLoading to false after loading', async () => {
      userServiceMock.getById.mockReturnValue(of(mockUser));

      component.loadUser();

      await new Promise(resolve => setTimeout(resolve, 0));
        expect(component.isLoading).toBe(false);
        
    });

    it('should handle empty bio and avatarUrl', async () => {
      const userWithoutOptionalFields = { ...mockUser, bio: undefined, avatarUrl: undefined };
      userServiceMock.getById.mockReturnValue(of(userWithoutOptionalFields));

      component.loadUser();

      await new Promise(resolve => setTimeout(resolve, 0));
        expect(component.userForm.value.bio).toBe('');
        expect(component.userForm.value.avatarUrl).toBe('');
        
    });

    it('should set error message on load failure', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = { message: 'User not found', error: { message: 'Not found' } };
      userServiceMock.getById.mockReturnValue(throwError(() => error));

      component.loadUser();

      await new Promise(resolve => setTimeout(resolve, 0));
        expect(component.error).toContain('Failed to load user data');
        expect(component.isLoading).toBe(false);
        consoleErrorSpy.mockRestore();
        
    });

    it('should log errors to console', async () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = { message: 'User not found' };
      userServiceMock.getById.mockReturnValue(throwError(() => error));

      component.loadUser();

      await new Promise(resolve => setTimeout(resolve, 0));
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading user:', error);
        consoleLogSpy.mockRestore();
        consoleErrorSpy.mockRestore();
        
    });
  });

  describe('onSubmit', () => {
    beforeEach(() => {
      component.userId = 1;
      component.currentPasswordHash = 'hashed-password';
      component.userForm.patchValue({
        username: 'updateduser',
        email: 'updated@example.com',
        bio: 'Updated bio',
        avatarUrl: 'https://example.com/new-avatar.jpg'
      });
    });

    it('should not submit when form is invalid', () => {
      component.userForm.patchValue({
        username: 'ab', // Too short
        email: 'invalid-email'
      });

      component.onSubmit();

      expect(userServiceMock.update).not.toHaveBeenCalled();
    });

    it('should not submit when userId is null', () => {
      component.userId = null;

      component.onSubmit();

      expect(userServiceMock.update).not.toHaveBeenCalled();
    });

    it('should call userService.update with userId and complete user object', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      userServiceMock.update.mockReturnValue(of(mockUser));

      component.onSubmit();

      expect(userServiceMock.update).toHaveBeenCalledWith(1, {
        id: 1,
        username: 'updateduser',
        email: 'updated@example.com',
        bio: 'Updated bio',
        avatarUrl: 'https://example.com/new-avatar.jpg',
        passwordHash: 'hashed-password'
      });
      consoleLogSpy.mockRestore();
    });

    it('should set successMessage on successful update', async () => {
      userServiceMock.update.mockReturnValue(of(mockUser));

      component.onSubmit();

      await new Promise(resolve => setTimeout(resolve, 0));
        expect(component.successMessage).toBe('Profile updated successfully!');
        
    });

    it('should navigate to /recipes after 2 seconds on success', async () => {
      userServiceMock.update.mockReturnValue(of(mockUser));
      routerMock.navigate.mockResolvedValue(true);

      component.onSubmit();

      // Wait for the 2 second delay
      await new Promise(resolve => setTimeout(resolve, 2100));

      expect(routerMock.navigate).toHaveBeenCalledWith(['/recipes']);
    });

    it('should not navigate immediately on success', async () => {
      userServiceMock.update.mockReturnValue(of(mockUser));

      component.onSubmit();

      setTimeout(() => {
        expect(routerMock.navigate).not.toHaveBeenCalled();
      }, 100);
    });

    it('should set error message on update failure', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = { message: 'Update failed' };
      userServiceMock.update.mockReturnValue(throwError(() => error));

      component.onSubmit();

      await new Promise(resolve => setTimeout(resolve, 0));
        expect(component.error).toBe('Failed to update profile');
        consoleErrorSpy.mockRestore();
        
    });

    it('should not navigate on update failure', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = { message: 'Update failed' };
      userServiceMock.update.mockReturnValue(throwError(() => error));

      component.onSubmit();

      setTimeout(() => {
        expect(routerMock.navigate).not.toHaveBeenCalled();
        consoleErrorSpy.mockRestore();
      }, 100);
    });

    it('should include existing passwordHash in update', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      component.currentPasswordHash = 'existing-hash';
      userServiceMock.update.mockReturnValue(of(mockUser));

      component.onSubmit();

      expect(userServiceMock.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ passwordHash: 'existing-hash' })
      );
      consoleLogSpy.mockRestore();
    });

    it('should handle empty bio in form', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      component.userForm.patchValue({ bio: '' });
      userServiceMock.update.mockReturnValue(of(mockUser));

      component.onSubmit();

      expect(userServiceMock.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ bio: '' })
      );
      consoleLogSpy.mockRestore();
    });

    it('should handle empty avatarUrl in form', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      component.userForm.patchValue({ avatarUrl: '' });
      userServiceMock.update.mockReturnValue(of(mockUser));

      component.onSubmit();

      expect(userServiceMock.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ avatarUrl: '' })
      );
      consoleLogSpy.mockRestore();
    });

    it('should log submission details', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      userServiceMock.update.mockReturnValue(of(mockUser));

      component.onSubmit();

      expect(consoleLogSpy).toHaveBeenCalledWith('Submitting user update:', expect.any(Object));
      expect(consoleLogSpy).toHaveBeenCalledWith('User ID:', 1);
      consoleLogSpy.mockRestore();
    });
  });

  describe('onCancel', () => {
    it('should navigate to /recipes', () => {
      component.onCancel();

      expect(routerMock.navigate).toHaveBeenCalledWith(['/recipes']);
    });

    it('should not modify form data', () => {
      component.userForm.patchValue({
        username: 'testuser',
        email: 'test@example.com'
      });

      const originalValues = { ...component.userForm.value };

      component.onCancel();

      expect(component.userForm.value).toEqual(originalValues);
    });
  });

  describe('Form Validation', () => {
    it('should require username with minimum 3 characters', () => {
      const usernameControl = component.userForm.get('username');

      usernameControl?.setValue('');
      expect(usernameControl?.valid).toBe(false);

      usernameControl?.setValue('ab');
      expect(usernameControl?.valid).toBe(false);

      usernameControl?.setValue('abc');
      expect(usernameControl?.valid).toBe(true);
    });

    it('should require valid email format', () => {
      const emailControl = component.userForm.get('email');

      emailControl?.setValue('');
      expect(emailControl?.valid).toBe(false);

      emailControl?.setValue('invalid');
      expect(emailControl?.valid).toBe(false);

      emailControl?.setValue('test@example.com');
      expect(emailControl?.valid).toBe(true);
    });

    it('should allow optional bio', () => {
      const bioControl = component.userForm.get('bio');

      bioControl?.setValue('');
      expect(bioControl?.valid).toBe(true);

      bioControl?.setValue('Some bio text');
      expect(bioControl?.valid).toBe(true);
    });

    it('should allow optional avatarUrl', () => {
      const avatarUrlControl = component.userForm.get('avatarUrl');

      avatarUrlControl?.setValue('');
      expect(avatarUrlControl?.valid).toBe(true);

      avatarUrlControl?.setValue('https://example.com/avatar.jpg');
      expect(avatarUrlControl?.valid).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle user with undefined passwordHash', async () => {
      const userWithoutPassword = { ...mockUser, passwordHash: undefined };
      userServiceMock.getById.mockReturnValue(of(userWithoutPassword));
      component.userId = 1;

      component.loadUser();

      await new Promise(resolve => setTimeout(resolve, 0));
        expect(component.currentPasswordHash).toBe('');
        
    });

    it('should handle special characters in username', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      fixture.detectChanges(); // Initialize the component
      component.userId = 1;
      component.userForm.patchValue({ username: 'test_user-123' });
      userServiceMock.update.mockReturnValue(of(mockUser));

      component.onSubmit();

      expect(userServiceMock.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ username: 'test_user-123' })
      );
      consoleLogSpy.mockRestore();
    });

    it('should handle very long bio', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      fixture.detectChanges(); // Initialize the component
      component.userId = 1;
      const longBio = 'a'.repeat(1000);
      component.userForm.patchValue({ bio: longBio });
      userServiceMock.update.mockReturnValue(of(mockUser));

      component.onSubmit();

      expect(userServiceMock.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ bio: longBio })
      );
      consoleLogSpy.mockRestore();
    });
  });
});
