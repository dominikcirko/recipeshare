import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { RecipeService } from './recipe.service';
import { Recipe } from './recipe.model';

describe('RecipeService', () => {
  let service: RecipeService;
  let httpMock: HttpTestingController;

  const mockRecipe: Recipe = {
    id: 1,
    userId: 1,
    title: 'Test Recipe',
    description: 'A test recipe description',
    instructions: 'Test instructions',
    cookTimeMinutes: 30,
    ingredients: 'Ingredient 1, Ingredient 2',
    calories: 500,
    protein: 20,
    fat: 15,
    carbs: 50
  };

  const mockRecipe2: Recipe = {
    id: 2,
    userId: 1,
    title: 'Test Recipe 2',
    description: 'Another test recipe',
    instructions: 'More instructions',
    cookTimeMinutes: 45,
    ingredients: 'Ingredient 3, Ingredient 4',
    calories: 600,
    protein: 25,
    fat: 20,
    carbs: 60
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RecipeService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(RecipeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getById', () => {
    it('should send GET request to /api/recipe/:id', () => {
      const recipeId = 1;

      service.getById(recipeId).subscribe();

      const req = httpMock.expectOne(`/api/recipe/${recipeId}`);
      expect(req.request.method).toBe('GET');

      req.flush(mockRecipe);
    });

    it('should return recipe by id on success', async () => {
      const recipeId = 1;

      service.getById(recipeId).subscribe(recipe => {
        expect(recipe).toEqual(mockRecipe);
      });

      const req = httpMock.expectOne(`/api/recipe/${recipeId}`);
      req.flush(mockRecipe);
    });

    it('should handle get by id error when recipe not found', async () => {
      const recipeId = 999;
      const errorMessage = 'Recipe not found';

      service.getById(recipeId).subscribe({
        next: () => expect.fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`/api/recipe/${recipeId}`);
      req.flush(errorMessage, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('getRecipesByIds', () => {
    it('should send multiple GET requests for each recipe id', () => {
      const recipeIds = [1, 2];

      service.getRecipesByIds(recipeIds).subscribe();

      recipeIds.forEach(id => {
        const req = httpMock.expectOne(`/api/recipe/${id}`);
        expect(req.request.method).toBe('GET');
        req.flush(id === 1 ? mockRecipe : mockRecipe2);
      });
    });

    it('should return array of recipes on success', async () => {
      const recipeIds = [1, 2];

      service.getRecipesByIds(recipeIds).subscribe(recipes => {
        expect(recipes.length).toBe(2);
        expect(recipes[0]).toEqual(mockRecipe);
        expect(recipes[1]).toEqual(mockRecipe2);
      });

      const req1 = httpMock.expectOne(`/api/recipe/1`);
      req1.flush(mockRecipe);

      const req2 = httpMock.expectOne(`/api/recipe/2`);
      req2.flush(mockRecipe2);
    });

    it('should filter out null recipes when a request fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const recipeIds = [1, 2, 3];

      service.getRecipesByIds(recipeIds).subscribe(recipes => {
        expect(recipes.length).toBe(2);
        expect(recipes[0]).toEqual(mockRecipe);
        expect(recipes[1]).toEqual(mockRecipe2);
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Failed to load recipe 3:',
          expect.anything()
        );
        consoleErrorSpy.mockRestore();
      });

      const req1 = httpMock.expectOne(`/api/recipe/1`);
      req1.flush(mockRecipe);

      const req2 = httpMock.expectOne(`/api/recipe/2`);
      req2.flush(mockRecipe2);

      const req3 = httpMock.expectOne(`/api/recipe/3`);
      req3.flush('Not found', { status: 404, statusText: 'Not Found' });
    });

    it('should return empty array when all requests fail', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const recipeIds = [1, 2];

      service.getRecipesByIds(recipeIds).subscribe(recipes => {
        expect(recipes.length).toBe(0);
        expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
        consoleErrorSpy.mockRestore();
      });

      const req1 = httpMock.expectOne(`/api/recipe/1`);
      req1.flush('Not found', { status: 404, statusText: 'Not Found' });

      const req2 = httpMock.expectOne(`/api/recipe/2`);
      req2.flush('Not found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle empty array of ids', async () => {
      service.getRecipesByIds([]).subscribe(recipes => {
        expect(recipes).toEqual([]);
      });
    });
  });

  describe('create', () => {
    it('should send POST request to /api/recipe with recipe data', () => {
      const newRecipe = { ...mockRecipe };
      delete newRecipe.id;

      service.create(newRecipe).subscribe();

      const req = httpMock.expectOne('/api/recipe');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newRecipe);

      req.flush(mockRecipe);
    });

    it('should return created recipe on success', async () => {
      const newRecipe = { ...mockRecipe };
      delete newRecipe.id;

      service.create(newRecipe).subscribe(recipe => {
        expect(recipe).toEqual(mockRecipe);
      });

      const req = httpMock.expectOne('/api/recipe');
      req.flush(mockRecipe);
    });

    it('should handle create error', async () => {
      const newRecipe = { ...mockRecipe };
      const errorMessage = 'Invalid recipe data';

      service.create(newRecipe).subscribe({
        next: () => expect.fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne('/api/recipe');
      req.flush(errorMessage, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('update', () => {
    it('should send PUT request to /api/recipe/:id with recipe data', () => {
      const recipeId = 1;
      const updatedRecipe = { ...mockRecipe, title: 'Updated Recipe' };

      service.update(recipeId, updatedRecipe).subscribe();

      const req = httpMock.expectOne(`/api/recipe/${recipeId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedRecipe);

      req.flush(updatedRecipe);
    });

    it('should return updated recipe on success', async () => {
      const recipeId = 1;
      const updatedRecipe = { ...mockRecipe, title: 'Updated Recipe' };

      service.update(recipeId, updatedRecipe).subscribe(recipe => {
        expect(recipe).toEqual(updatedRecipe);
      });

      const req = httpMock.expectOne(`/api/recipe/${recipeId}`);
      req.flush(updatedRecipe);
    });

    it('should handle update error', async () => {
      const recipeId = 1;
      const errorMessage = 'Unauthorized';

      service.update(recipeId, mockRecipe).subscribe({
        next: () => expect.fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(403);
        }
      });

      const req = httpMock.expectOne(`/api/recipe/${recipeId}`);
      req.flush(errorMessage, { status: 403, statusText: 'Forbidden' });
    });
  });

  describe('delete', () => {
    it('should send DELETE request to /api/recipe/:id', () => {
      const recipeId = 1;

      service.delete(recipeId).subscribe();

      const req = httpMock.expectOne(`/api/recipe/${recipeId}`);
      expect(req.request.method).toBe('DELETE');

      req.flush(null);
    });

    it('should complete successfully on delete', async () => {
      const recipeId = 1;

      service.delete(recipeId).subscribe({
        next: () => {
          expect(true).toBe(true);
        },
        error: () => expect.fail('should not have failed')
      });

      const req = httpMock.expectOne(`/api/recipe/${recipeId}`);
      req.flush(null);
    });

    it('should handle delete error', async () => {
      const recipeId = 1;
      const errorMessage = 'Cannot delete recipe';

      service.delete(recipeId).subscribe({
        next: () => expect.fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`/api/recipe/${recipeId}`);
      req.flush(errorMessage, { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('getRecipesByUserId', () => {
    it('should send GET request to /api/recipe/users/:userId', () => {
      const userId = 1;

      service.getRecipesByUserId(userId).subscribe();

      const req = httpMock.expectOne(`/api/recipe/users/${userId}`);
      expect(req.request.method).toBe('GET');

      req.flush([mockRecipe, mockRecipe2]);
    });

    it('should return array of recipes for user on success', async () => {
      const userId = 1;

      service.getRecipesByUserId(userId).subscribe(recipes => {
        expect(recipes.length).toBe(2);
        expect(recipes[0]).toEqual(mockRecipe);
        expect(recipes[1]).toEqual(mockRecipe2);
      });

      const req = httpMock.expectOne(`/api/recipe/users/${userId}`);
      req.flush([mockRecipe, mockRecipe2]);
    });

    it('should return empty array when user has no recipes', async () => {
      const userId = 1;

      service.getRecipesByUserId(userId).subscribe(recipes => {
        expect(recipes).toEqual([]);
      });

      const req = httpMock.expectOne(`/api/recipe/users/${userId}`);
      req.flush([]);
    });

    it('should handle get recipes by user id error', async () => {
      const userId = 999;
      const errorMessage = 'User not found';

      service.getRecipesByUserId(userId).subscribe({
        next: () => expect.fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`/api/recipe/users/${userId}`);
      req.flush(errorMessage, { status: 404, statusText: 'Not Found' });
    });
  });
});
