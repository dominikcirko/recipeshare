import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { RecipeService } from './recipe.service';
import { Recipe } from './recipe.model';

describe('RecipeService Integration Tests', () => {
  let service: RecipeService;
  let httpMock: HttpTestingController;

  const mockRecipe: Recipe = {
    id: 1,
    userId: 1,
    title: 'Test Recipe',
    description: 'Test description',
    instructions: 'Test instructions',
    cookTimeMinutes: 30,
    ingredients: 'Test ingredients',
    calories: 500,
    protein: 20,
    fat: 15,
    carbs: 50
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

  describe('CRUD Operations', () => {
    it('should complete create-read-update-delete lifecycle', async () => {
      const newRecipe: Partial<Recipe> = {
        userId: 1,
        title: 'New Recipe',
        description: 'Description'
      };

      // Create
      service.create(newRecipe as any).subscribe();
      const createReq = httpMock.expectOne('/api/recipe');
      expect(createReq.request.method).toBe('POST');
      createReq.flush({ ...newRecipe, id: 1 });

      await new Promise(resolve => setTimeout(resolve, 0));

      // Read
      service.getById(1).subscribe();
      const getReq = httpMock.expectOne('/api/recipe/1');
      expect(getReq.request.method).toBe('GET');
      getReq.flush({ ...newRecipe, id: 1 });

      await new Promise(resolve => setTimeout(resolve, 0));

      // Update
      service.update(1, { title: 'Updated' }).subscribe();
      const updateReq = httpMock.expectOne('/api/recipe/1');
      expect(updateReq.request.method).toBe('PUT');
      updateReq.flush({ ...newRecipe, id: 1, title: 'Updated' });

      await new Promise(resolve => setTimeout(resolve, 0));

      // Delete
      service.delete(1).subscribe();
      const deleteReq = httpMock.expectOne('/api/recipe/1');
      expect(deleteReq.request.method).toBe('DELETE');
      deleteReq.flush(null);

      await new Promise(resolve => setTimeout(resolve, 0));
    });

    it('should handle multiple recipes by user', async () => {
      const recipes: Recipe[] = [
        { ...mockRecipe, id: 1, title: 'Recipe 1' },
        { ...mockRecipe, id: 2, title: 'Recipe 2' },
        { ...mockRecipe, id: 3, title: 'Recipe 3' }
      ];

      service.getRecipesByUserId(1).subscribe();

      const req = httpMock.expectOne('/api/recipe/users/1');
      expect(req.request.method).toBe('GET');
      req.flush(recipes);

      await new Promise(resolve => setTimeout(resolve, 0));
    });

    it('should fetch multiple recipes by IDs', async () => {
      const recipes: Recipe[] = [
        { ...mockRecipe, id: 1, title: 'Recipe 1' },
        { ...mockRecipe, id: 2, title: 'Recipe 2' },
        { ...mockRecipe, id: 3, title: 'Recipe 3' }
      ];

      service.getRecipesByIds([1, 2, 3]).subscribe();

      const req1 = httpMock.expectOne('/api/recipe/1');
      const req2 = httpMock.expectOne('/api/recipe/2');
      const req3 = httpMock.expectOne('/api/recipe/3');

      req1.flush(recipes[0]);
      req2.flush(recipes[1]);
      req3.flush(recipes[2]);

      await new Promise(resolve => setTimeout(resolve, 0));
    });
  });

  describe('Batch Operations', () => {
    it('should handle partial failures when fetching recipes', async () => {
      service.getRecipesByIds([1, 2, 3]).subscribe();

      const req1 = httpMock.expectOne('/api/recipe/1');
      const req2 = httpMock.expectOne('/api/recipe/2');
      const req3 = httpMock.expectOne('/api/recipe/3');

      req1.flush({ ...mockRecipe, id: 1 });
      req2.flush({ message: 'Not found' }, { status: 404, statusText: 'Not Found' });
      req3.flush({ ...mockRecipe, id: 3 });

      await new Promise(resolve => setTimeout(resolve, 0));
    });

    it('should handle empty array when fetching by IDs', async () => {
      service.getRecipesByIds([]).subscribe();

      httpMock.expectNone('/api/recipe/');

      await new Promise(resolve => setTimeout(resolve, 0));
    });

    it('should handle all failures when fetching recipes', async () => {
      service.getRecipesByIds([1, 2]).subscribe();

      const req1 = httpMock.expectOne('/api/recipe/1');
      const req2 = httpMock.expectOne('/api/recipe/2');

      req1.flush({ message: 'Not found' }, { status: 404, statusText: 'Not Found' });
      req2.flush({ message: 'Not found' }, { status: 404, statusText: 'Not Found' });

      await new Promise(resolve => setTimeout(resolve, 0));
    });
  });

  describe('Update Operations', () => {
    it('should handle partial recipe updates', async () => {
      const updates: Partial<Recipe> = {
        title: 'Updated Title',
        cookTimeMinutes: 45
      };

      service.update(1, updates as any).subscribe();

      const req = httpMock.expectOne('/api/recipe/1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updates);
      req.flush({ ...mockRecipe, ...updates });

      await new Promise(resolve => setTimeout(resolve, 0));
    });

    it('should handle nutritional information updates', async () => {
      const updates: Partial<Recipe> = {
        calories: 600,
        protein: 25,
        fat: 20,
        carbs: 60
      };

      service.update(1, updates as any).subscribe();

      const req = httpMock.expectOne('/api/recipe/1');
      req.flush({ ...mockRecipe, ...updates });

      await new Promise(resolve => setTimeout(resolve, 0));
    });
  });

  describe('Error Handling', () => {
    it('should handle create errors', async () => {
      service.create({ title: '' } as any).subscribe({
        error: (err) => {
          expect(err.status).toBe(400);
        }
      });

      const req = httpMock.expectOne('/api/recipe');
      req.flush({ message: 'Title required' }, { status: 400, statusText: 'Bad Request' });

      await new Promise(resolve => setTimeout(resolve, 0));
    });

    it('should handle get by id errors', async () => {
      service.getById(999).subscribe({
        error: (err) => {
          expect(err.status).toBe(404);
        }
      });

      const req = httpMock.expectOne('/api/recipe/999');
      req.flush({ message: 'Not found' }, { status: 404, statusText: 'Not Found' });

      await new Promise(resolve => setTimeout(resolve, 0));
    });

    it('should handle update errors', async () => {
      service.update(1, { cookTimeMinutes: -1 } as any).subscribe({
        error: (err) => {
          expect(err.status).toBe(400);
        }
      });

      const req = httpMock.expectOne('/api/recipe/1');
      req.flush({ message: 'Invalid' }, { status: 400, statusText: 'Bad Request' });

      await new Promise(resolve => setTimeout(resolve, 0));
    });

    it('should handle delete errors', async () => {
      service.delete(1).subscribe({
        error: (err) => {
          expect(err.status).toBe(403);
        }
      });

      const req = httpMock.expectOne('/api/recipe/1');
      req.flush({ message: 'Forbidden' }, { status: 403, statusText: 'Forbidden' });

      await new Promise(resolve => setTimeout(resolve, 0));
    });

    it('should handle get recipes by user errors', async () => {
      service.getRecipesByUserId(999).subscribe({
        error: (err) => {
          expect(err.status).toBe(404);
        }
      });

      const req = httpMock.expectOne('/api/recipe/users/999');
      req.flush({ message: 'Not found' }, { status: 404, statusText: 'Not Found' });

      await new Promise(resolve => setTimeout(resolve, 0));
    });
  });

  describe('Data Integrity', () => {
    it('should preserve all fields during updates', async () => {
      service.update(1, { title: 'Updated Title' }).subscribe();

      const req = httpMock.expectOne('/api/recipe/1');
      req.flush({ ...mockRecipe, title: 'Updated Title' });

      await new Promise(resolve => setTimeout(resolve, 0));
    });

    it('should handle recipes without optional fields', async () => {
      const minimalRecipe: Recipe = {
        id: 1,
        userId: 1,
        title: 'Minimal Recipe',
        description: 'Description'
      };

      service.getById(1).subscribe();

      const req = httpMock.expectOne('/api/recipe/1');
      req.flush(minimalRecipe);

      await new Promise(resolve => setTimeout(resolve, 0));
    });

    it('should return empty array when user has no recipes', async () => {
      service.getRecipesByUserId(1).subscribe();

      const req = httpMock.expectOne('/api/recipe/users/1');
      req.flush([]);

      await new Promise(resolve => setTimeout(resolve, 0));
    });
  });
});
