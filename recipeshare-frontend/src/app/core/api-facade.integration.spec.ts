import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ApiFacade } from './api-facade.service';
import { UserService } from '../feature/user/user.service';
import { RecipeService } from '../feature/recipe/recipe.service';
import { LoginService } from '../feature/user/login-form/login.service';
import { User } from '../feature/user/user.model';
import { Recipe } from '../feature/recipe/recipe.model';

describe('ApiFacade Integration Tests', () => {
  let facade: ApiFacade;
  let httpMock: HttpTestingController;

  const mockUser: User = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    passwordHash: 'hashed-password'
  };

  const mockLoginResponse = {
    userId: 1,
    token: 'test-token',
    username: 'testuser',
    email: 'test@example.com'
  };

  const mockRecipe: Recipe = {
    id: 1,
    userId: 1,
    title: 'Test Recipe',
    description: 'Test description'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ApiFacade,
        UserService,
        RecipeService,
        LoginService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    facade = TestBed.inject(ApiFacade);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('User Management Flow', () => {
    it('should get current user through facade', async () => {
      localStorage.setItem('auth_token', 'test-token');
      localStorage.setItem('current_user', JSON.stringify(mockLoginResponse));

      facade.getCurrentUser().subscribe();

      const req = httpMock.expectOne('/api/users/1');
      req.flush(mockUser);

      await new Promise(resolve => setTimeout(resolve, 0));
    });

    it('should update current user through facade', async () => {
      localStorage.setItem('auth_token', 'test-token');
      localStorage.setItem('current_user', JSON.stringify(mockLoginResponse));

      facade.updateCurrentUser({ bio: 'Updated bio' }).subscribe();

      const req = httpMock.expectOne('/api/users/1');
      req.flush({ ...mockUser, bio: 'Updated bio' });

      await new Promise(resolve => setTimeout(resolve, 0));
    });

    it('should handle logout through facade', () => {
      localStorage.setItem('auth_token', 'test-token');
      localStorage.setItem('current_user', JSON.stringify(mockLoginResponse));

      facade.logout();

      expect(localStorage.getItem('auth_token')).toBeNull();
    });
  });

  describe('Recipe Management Flow', () => {
    beforeEach(() => {
      localStorage.setItem('auth_token', 'test-token');
      localStorage.setItem('current_user', JSON.stringify(mockLoginResponse));
    });

    it('should get current user recipes', async () => {
      const recipes: Recipe[] = [
        { ...mockRecipe, id: 1, title: 'Recipe 1' },
        { ...mockRecipe, id: 2, title: 'Recipe 2' }
      ];

      facade.getCurrentUserRecipes().subscribe();

      const req = httpMock.expectOne('/api/recipe/users/1');
      req.flush(recipes);

      await new Promise(resolve => setTimeout(resolve, 0));
    });

    it('should handle user with no recipes', async () => {
      facade.getCurrentUserRecipes().subscribe();

      const req = httpMock.expectOne('/api/recipe/users/1');
      req.flush([]);

      await new Promise(resolve => setTimeout(resolve, 0));
    });
  });

  describe('Combined Operations', () => {
    it('should get user and recipes in sequence', async () => {
      localStorage.setItem('auth_token', 'test-token');
      localStorage.setItem('current_user', JSON.stringify(mockLoginResponse));

      const recipes: Recipe[] = [{ ...mockRecipe, id: 1 }];

      facade.getCurrentUser().subscribe();
      const userReq = httpMock.expectOne('/api/users/1');
      userReq.flush(mockUser);

      await new Promise(resolve => setTimeout(resolve, 0));

      facade.getCurrentUserRecipes().subscribe();
      const recipesReq = httpMock.expectOne('/api/recipe/users/1');
      recipesReq.flush(recipes);

      await new Promise(resolve => setTimeout(resolve, 0));
    });

    it('should handle update and refresh flow', async () => {
      localStorage.setItem('auth_token', 'test-token');
      localStorage.setItem('current_user', JSON.stringify(mockLoginResponse));

      const updates = { bio: 'New bio' };

      facade.updateCurrentUser(updates).subscribe();
      const updateReq = httpMock.expectOne('/api/users/1');
      updateReq.flush({ ...mockUser, ...updates });

      await new Promise(resolve => setTimeout(resolve, 0));

      facade.getCurrentUser().subscribe();
      const refreshReq = httpMock.expectOne('/api/users/1');
      refreshReq.flush({ ...mockUser, ...updates });

      await new Promise(resolve => setTimeout(resolve, 0));
    });
  });

  describe('Error Handling', () => {
    it('should propagate user fetch errors', async () => {
      localStorage.setItem('auth_token', 'test-token');
      localStorage.setItem('current_user', JSON.stringify(mockLoginResponse));

      facade.getCurrentUser().subscribe({
        error: (err) => {
          expect(err.status).toBe(404);
        }
      });

      const req = httpMock.expectOne('/api/users/1');
      req.flush({ message: 'Not found' }, { status: 404, statusText: 'Not Found' });

      await new Promise(resolve => setTimeout(resolve, 0));
    });

    it('should propagate update errors', async () => {
      localStorage.setItem('auth_token', 'test-token');
      localStorage.setItem('current_user', JSON.stringify(mockLoginResponse));

      facade.updateCurrentUser({ email: 'invalid' }).subscribe({
        error: (err) => {
          expect(err.status).toBe(400);
        }
      });

      const req = httpMock.expectOne('/api/users/1');
      req.flush({ message: 'Invalid' }, { status: 400, statusText: 'Bad Request' });

      await new Promise(resolve => setTimeout(resolve, 0));
    });

    it('should throw error when no user is logged in', () => {
      expect(() => facade.getCurrentUser()).toThrow('No user logged in');
      httpMock.expectNone('/api/users/');
    });
  });

  describe('Facade Unification', () => {
    it('should provide consistent interface', async () => {
      localStorage.setItem('auth_token', 'test-token');
      localStorage.setItem('current_user', JSON.stringify(mockLoginResponse));

      facade.getCurrentUser().subscribe();
      const userReq = httpMock.expectOne('/api/users/1');
      userReq.flush(mockUser);

      await new Promise(resolve => setTimeout(resolve, 0));

      facade.getCurrentUserRecipes().subscribe();
      const recipesReq = httpMock.expectOne('/api/recipe/users/1');
      recipesReq.flush([]);

      await new Promise(resolve => setTimeout(resolve, 0));
    });
  });
});
