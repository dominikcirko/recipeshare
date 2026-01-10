import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ApiFacade } from './api-facade.service';
import { UserService } from '../feature/user/user.service';
import { RecipeService } from '../feature/recipe/recipe.service';
import { LoginService } from '../feature/user/login-form/login.service';
import { User } from '../feature/user/user.model';
import { Recipe } from '../feature/recipe/recipe.model';

describe('ApiFacade', () => {
  let service: ApiFacade;
  let userServiceMock: any;
  let recipeServiceMock: any;
  let loginServiceMock: any;

  const mockUser: User = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    bio: 'Test bio',
    avatarUrl: 'https://example.com/avatar.jpg'
  };

  const mockRecipe: Recipe = {
    id: 1,
    userId: 1,
    title: 'Test Recipe',
    description: 'A test recipe',
    instructions: 'Test instructions',
    cookTimeMinutes: 30,
    ingredients: 'Ingredient 1, Ingredient 2',
    calories: 500,
    protein: 20,
    fat: 15,
    carbs: 50
  };

  beforeEach(() => {
    // Create spy objects with all necessary methods
    userServiceMock = {
      getById: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
      delete: vi.fn()
    } as any;

    recipeServiceMock = {
      getRecipesByUserId: vi.fn(),
      getById: vi.fn(),
      getRecipesByIds: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    } as any;

    loginServiceMock = {
      getCurrentUserId: vi.fn(),
      logout: vi.fn(),
      login: vi.fn(),
      getToken: vi.fn(),
      isLoggedIn: vi.fn()
    } as any;

    TestBed.configureTestingModule({
      providers: [
        ApiFacade,
        { provide: UserService, useValue: userServiceMock },
        { provide: RecipeService, useValue: recipeServiceMock },
        { provide: LoginService, useValue: loginServiceMock }
      ]
    });

    service = TestBed.inject(ApiFacade);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCurrentUser', () => {
    it('should call loginService.getCurrentUserId to get user id', () => {
      loginServiceMock.getCurrentUserId.mockReturnValue(1);
      userServiceMock.getById.mockReturnValue(of(mockUser));

      service.getCurrentUser().subscribe();

      expect(loginServiceMock.getCurrentUserId).toHaveBeenCalled();
    });

    it('should call userService.getById with current user id', () => {
      const userId = 1;
      loginServiceMock.getCurrentUserId.mockReturnValue(userId);
      userServiceMock.getById.mockReturnValue(of(mockUser));

      service.getCurrentUser().subscribe();

      expect(userServiceMock.getById).toHaveBeenCalledWith(userId);
    });

    it('should return current user data on success', async () => {
      loginServiceMock.getCurrentUserId.mockReturnValue(1);
      userServiceMock.getById.mockReturnValue(of(mockUser));

      service.getCurrentUser().subscribe(user => {
        expect(user).toEqual(mockUser);
      });
    });

    it('should throw error when no user is logged in', () => {
      loginServiceMock.getCurrentUserId.mockReturnValue(null);

      expect(() => service.getCurrentUser()).toThrow('No user logged in');
    });

    it('should propagate error from userService', async () => {
      const error = new Error('User not found');
      loginServiceMock.getCurrentUserId.mockReturnValue(1);
      userServiceMock.getById.mockReturnValue(throwError(() => error));

      service.getCurrentUser().subscribe({
        next: () => expect.fail('should have failed'),
        error: (err) => {
          expect(err).toBe(error);
          }
      });
    });
  });

  describe('updateCurrentUser', () => {
    it('should call loginService.getCurrentUserId to get user id', () => {
      const updates = { username: 'newusername' };
      loginServiceMock.getCurrentUserId.mockReturnValue(1);
      userServiceMock.update.mockReturnValue(of(mockUser));

      service.updateCurrentUser(updates).subscribe();

      expect(loginServiceMock.getCurrentUserId).toHaveBeenCalled();
    });

    it('should call userService.update with current user id and updates', () => {
      const userId = 1;
      const updates = { username: 'newusername' };
      loginServiceMock.getCurrentUserId.mockReturnValue(userId);
      userServiceMock.update.mockReturnValue(of({ ...mockUser, ...updates }));

      service.updateCurrentUser(updates).subscribe();

      expect(userServiceMock.update).toHaveBeenCalledWith(userId, updates);
    });

    it('should return updated user data on success', async () => {
      const updates = { username: 'newusername' };
      const updatedUser = { ...mockUser, ...updates };
      loginServiceMock.getCurrentUserId.mockReturnValue(1);
      userServiceMock.update.mockReturnValue(of(updatedUser));

      service.updateCurrentUser(updates).subscribe(user => {
        expect(user).toEqual(updatedUser);
      });
    });

    it('should throw error when no user is logged in', () => {
      loginServiceMock.getCurrentUserId.mockReturnValue(null);

      expect(() => service.updateCurrentUser({})).toThrow('No user logged in');
    });

    it('should propagate error from userService', async () => {
      const error = new Error('Update failed');
      loginServiceMock.getCurrentUserId.mockReturnValue(1);
      userServiceMock.update.mockReturnValue(throwError(() => error));

      service.updateCurrentUser({ username: 'newusername' }).subscribe({
        next: () => expect.fail('should have failed'),
        error: (err) => {
          expect(err).toBe(error);
          }
      });
    });

    it('should handle partial updates', async () => {
      const partialUpdates = { bio: 'New bio' };
      const updatedUser = { ...mockUser, bio: 'New bio' };
      loginServiceMock.getCurrentUserId.mockReturnValue(1);
      userServiceMock.update.mockReturnValue(of(updatedUser));

      service.updateCurrentUser(partialUpdates).subscribe(user => {
        expect(user.bio).toBe('New bio');
      });
    });
  });

  describe('getCurrentUserRecipes', () => {
    it('should call loginService.getCurrentUserId to get user id', () => {
      loginServiceMock.getCurrentUserId.mockReturnValue(1);
      recipeServiceMock.getRecipesByUserId.mockReturnValue(of([mockRecipe]));

      service.getCurrentUserRecipes().subscribe();

      expect(loginServiceMock.getCurrentUserId).toHaveBeenCalled();
    });

    it('should call recipeService.getRecipesByUserId with current user id', () => {
      const userId = 1;
      loginServiceMock.getCurrentUserId.mockReturnValue(userId);
      recipeServiceMock.getRecipesByUserId.mockReturnValue(of([mockRecipe]));

      service.getCurrentUserRecipes().subscribe();

      expect(recipeServiceMock.getRecipesByUserId).toHaveBeenCalledWith(userId);
    });

    it('should return array of recipes on success', async () => {
      const recipes = [mockRecipe, { ...mockRecipe, id: 2, title: 'Recipe 2' }];
      loginServiceMock.getCurrentUserId.mockReturnValue(1);
      recipeServiceMock.getRecipesByUserId.mockReturnValue(of(recipes));

      service.getCurrentUserRecipes().subscribe(result => {
        expect(result).toEqual(recipes);
        expect(result.length).toBe(2);
      });
    });

    it('should return empty array when user has no recipes', async () => {
      loginServiceMock.getCurrentUserId.mockReturnValue(1);
      recipeServiceMock.getRecipesByUserId.mockReturnValue(of([]));

      service.getCurrentUserRecipes().subscribe(recipes => {
        expect(recipes).toEqual([]);
      });
    });

    it('should throw error when no user is logged in', () => {
      loginServiceMock.getCurrentUserId.mockReturnValue(null);

      expect(() => service.getCurrentUserRecipes()).toThrow('No user logged in');
    });

    it('should propagate error from recipeService', async () => {
      const error = new Error('Failed to fetch recipes');
      loginServiceMock.getCurrentUserId.mockReturnValue(1);
      recipeServiceMock.getRecipesByUserId.mockReturnValue(throwError(() => error));

      service.getCurrentUserRecipes().subscribe({
        next: () => expect.fail('should have failed'),
        error: (err) => {
          expect(err).toBe(error);
          }
      });
    });
  });

  describe('logout', () => {
    it('should call loginService.logout', () => {
      service.logout();

      expect(loginServiceMock.logout).toHaveBeenCalled();
    });

    it('should not throw error', () => {
      expect(() => service.logout()).not.toThrow();
    });
  });

  describe('Facade Pattern Integration', () => {
    it('should provide unified interface to multiple services', () => {
      loginServiceMock.getCurrentUserId.mockReturnValue(1);
      userServiceMock.getById.mockReturnValue(of(mockUser));
      recipeServiceMock.getRecipesByUserId.mockReturnValue(of([mockRecipe]));

      service.getCurrentUser().subscribe();
      service.getCurrentUserRecipes().subscribe();

      expect(loginServiceMock.getCurrentUserId).toHaveBeenCalledTimes(2);
      expect(userServiceMock.getById).toHaveBeenCalledTimes(1);
      expect(recipeServiceMock.getRecipesByUserId).toHaveBeenCalledTimes(1);
    });

    it('should maintain consistent error handling across methods', () => {
      loginServiceMock.getCurrentUserId.mockReturnValue(null);

      expect(() => service.getCurrentUser()).toThrow('No user logged in');
      expect(() => service.updateCurrentUser({})).toThrow('No user logged in');
      expect(() => service.getCurrentUserRecipes()).toThrow('No user logged in');
    });
  });
});
