import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { RecipeFormComponent } from './recipe-form.component';
import { RecipeService } from '../recipe.service';
import { LoginService } from '../../user/login-form/login.service';
import { Recipe } from '../recipe.model';

describe('RecipeFormComponent', () => {
  let component: RecipeFormComponent;
  let fixture: ComponentFixture<RecipeFormComponent>;
  let recipeServiceMock: any;
  let loginServiceMock: any;
  let routerMock: any;
  let activatedRouteMock: any;

  const mockRecipe: Recipe = {
    id: 1,
    userId: 1,
    title: 'Test Recipe',
    description: 'A test recipe',
    instructions: 'Test instructions',
    cookTimeMinutes: 30,
    ingredients: 'Test ingredients',
    calories: 500,
    protein: 20,
    fat: 15,
    carbs: 50
  };

  beforeEach(async () => {
    recipeServiceMock = {
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      getRecipesByUserId: vi.fn(),
      getRecipesByIds: vi.fn()
    };

    loginServiceMock = {
      getCurrentUserId: vi.fn().mockReturnValue(1),
      login: vi.fn(),
      logout: vi.fn(),
      getToken: vi.fn(),
      isLoggedIn: vi.fn()
    };

    routerMock = {
      navigate: vi.fn(),
      url: '/recipes/new'
    };

    activatedRouteMock = {
      params: of({})
    };

    await TestBed.configureTestingModule({
      imports: [RecipeFormComponent, ReactiveFormsModule],
      providers: [
        { provide: RecipeService, useValue: recipeServiceMock },
        { provide: LoginService, useValue: loginServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RecipeFormComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with isEditMode as false', () => {
      expect(component.isEditMode).toBe(false);
    });

    it('should initialize with isViewMode as false', () => {
      expect(component.isViewMode).toBe(false);
    });

    it('should initialize with isSubmitting as false', () => {
      expect(component.isSubmitting).toBe(false);
    });

    it('should create recipeForm with all controls', () => {
      expect(component.recipeForm.get('title')).toBeDefined();
      expect(component.recipeForm.get('description')).toBeDefined();
      expect(component.recipeForm.get('instructions')).toBeDefined();
      expect(component.recipeForm.get('cookTimeMinutes')).toBeDefined();
      expect(component.recipeForm.get('ingredients')).toBeDefined();
      expect(component.recipeForm.get('calories')).toBeDefined();
      expect(component.recipeForm.get('protein')).toBeDefined();
      expect(component.recipeForm.get('fat')).toBeDefined();
      expect(component.recipeForm.get('carbs')).toBeDefined();
    });
  });

  describe('Form Validators', () => {
    it('should make title required', () => {
      const titleControl = component.recipeForm.get('title');
      titleControl?.setValue('');
      expect(titleControl?.hasError('required')).toBe(true);
    });

    it('should enforce min validator on cookTimeMinutes', () => {
      const cookTimeControl = component.recipeForm.get('cookTimeMinutes');
      cookTimeControl?.setValue(0);
      expect(cookTimeControl?.hasError('min')).toBe(true);
    });

    it('should enforce min validator on calories', () => {
      const caloriesControl = component.recipeForm.get('calories');
      caloriesControl?.setValue(-1);
      expect(caloriesControl?.hasError('min')).toBe(true);
    });

    it('should enforce min validator on protein', () => {
      const proteinControl = component.recipeForm.get('protein');
      proteinControl?.setValue(-1);
      expect(proteinControl?.hasError('min')).toBe(true);
    });

    it('should enforce min validator on fat', () => {
      const fatControl = component.recipeForm.get('fat');
      fatControl?.setValue(-1);
      expect(fatControl?.hasError('min')).toBe(true);
    });

    it('should enforce min validator on carbs', () => {
      const carbsControl = component.recipeForm.get('carbs');
      carbsControl?.setValue(-1);
      expect(carbsControl?.hasError('min')).toBe(true);
    });

    it('should allow null values for optional numeric fields', () => {
      component.recipeForm.patchValue({
        title: 'Test Recipe',
        cookTimeMinutes: null,
        calories: null,
        protein: null,
        fat: null,
        carbs: null
      });
      expect(component.recipeForm.valid).toBe(true);
    });
  });

  describe('ngOnInit', () => {
    it('should set isViewMode when URL includes /view/', () => {
      routerMock.url = '/recipes/view/1';
      activatedRouteMock.params = of({ id: '1' });
      recipeServiceMock.getById.mockReturnValue(of(mockRecipe));

      fixture.detectChanges();

      expect(component.isViewMode).toBe(true);
    });

    it('should set isEditMode when URL includes /edit/', () => {
      routerMock.url = '/recipes/edit/1';
      activatedRouteMock.params = of({ id: '1' });
      recipeServiceMock.getById.mockReturnValue(of(mockRecipe));

      fixture.detectChanges();

      expect(component.isEditMode).toBe(true);
    });

    it('should call loadRecipe when id is present in params', () => {
      routerMock.url = '/recipes/edit/1';
      activatedRouteMock.params = of({ id: '1' });
      recipeServiceMock.getById.mockReturnValue(of(mockRecipe));
      const loadRecipeSpy = vi.spyOn(component, 'loadRecipe');

      fixture.detectChanges();

      expect(loadRecipeSpy).toHaveBeenCalledWith(1);
    });

    it('should not call loadRecipe when no id in params', () => {
      routerMock.url = '/recipes/new';
      activatedRouteMock.params = of({});
      const loadRecipeSpy = vi.spyOn(component, 'loadRecipe');

      fixture.detectChanges();

      expect(loadRecipeSpy).not.toHaveBeenCalled();
    });
  });

  describe('loadRecipe', () => {
    it('should call recipeService.getById', () => {
      recipeServiceMock.getById.mockReturnValue(of(mockRecipe));

      component.loadRecipe(1);

      expect(recipeServiceMock.getById).toHaveBeenCalledWith(1);
    });

    it('should patch form with recipe data', async () => {
      recipeServiceMock.getById.mockReturnValue(of(mockRecipe));

      component.loadRecipe(1);

      await new Promise(resolve => setTimeout(resolve, 0));
      expect(component.recipeForm.value.title).toBe(mockRecipe.title);
      expect(component.recipeForm.value.description).toBe(mockRecipe.description);
    });

    it('should disable form in view mode', async () => {
      component.isViewMode = true;
      recipeServiceMock.getById.mockReturnValue(of(mockRecipe));

      component.loadRecipe(1);

      await new Promise(resolve => setTimeout(resolve, 0));
      expect(component.recipeForm.disabled).toBe(true);
    });

    it('should not disable form in edit mode', async () => {
      component.isViewMode = false;
      recipeServiceMock.getById.mockReturnValue(of(mockRecipe));

      component.loadRecipe(1);

      await new Promise(resolve => setTimeout(resolve, 0));
      expect(component.recipeForm.disabled).toBe(false);
    });

    it('should handle load error', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      const error = { message: 'Recipe not found' };
      recipeServiceMock.getById.mockReturnValue(throwError(() => error));

      component.loadRecipe(1);

      await new Promise(resolve => setTimeout(resolve, 0));
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading recipe:', error);
      expect(alertSpy).toHaveBeenCalledWith('Failed to load recipe');
      consoleErrorSpy.mockRestore();
      alertSpy.mockRestore();
    });
  });

  describe('onEdit', () => {
    it('should navigate to edit page when recipeId exists', () => {
      component.recipeId = 1;

      component.onEdit();

      expect(routerMock.navigate).toHaveBeenCalledWith(['/recipes/edit', 1]);
    });

    it('should not navigate when recipeId is undefined', () => {
      component.recipeId = undefined;

      component.onEdit();

      expect(routerMock.navigate).not.toHaveBeenCalled();
    });
  });

  describe('onDelete', () => {
    beforeEach(() => {
      component.recipeId = 1;
    });

    it('should not delete when recipeId is undefined', () => {
      component.recipeId = undefined;

      component.onDelete();

      expect(recipeServiceMock.delete).not.toHaveBeenCalled();
    });

    it('should not delete when user cancels confirmation', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false);

      component.onDelete();

      expect(recipeServiceMock.delete).not.toHaveBeenCalled();
    });

    it('should call recipeService.delete when confirmed', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      recipeServiceMock.delete.mockReturnValue(of(null));

      component.onDelete();

      expect(recipeServiceMock.delete).toHaveBeenCalledWith(1);
    });

    it('should navigate to recipes list after successful deletion', async () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      recipeServiceMock.delete.mockReturnValue(of(null));

      component.onDelete();

      await new Promise(resolve => setTimeout(resolve, 0));
      expect(routerMock.navigate).toHaveBeenCalledWith(['/recipes']);
      consoleLogSpy.mockRestore();
    });

    it('should handle delete error', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      const error = { error: { message: 'Cannot delete' }, message: 'Delete failed' };
      recipeServiceMock.delete.mockReturnValue(throwError(() => error));

      component.onDelete();

      await new Promise(resolve => setTimeout(resolve, 0));
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error deleting recipe:', error);
      expect(alertSpy).toHaveBeenCalledWith('Failed to delete recipe: Cannot delete');
      consoleErrorSpy.mockRestore();
      alertSpy.mockRestore();
    });
  });

  describe('onSubmit', () => {
    beforeEach(() => {
      component.recipeForm.patchValue({
        title: 'New Recipe',
        description: 'Description',
        instructions: 'Instructions',
        cookTimeMinutes: 30,
        ingredients: 'Ingredients',
        calories: 500,
        protein: 20,
        fat: 15,
        carbs: 50
      });
    });

    it('should not submit when form is invalid', () => {
      component.recipeForm.patchValue({ title: '' });

      component.onSubmit();

      expect(recipeServiceMock.create).not.toHaveBeenCalled();
      expect(recipeServiceMock.update).not.toHaveBeenCalled();
    });

    it('should mark all fields as touched when form is invalid', () => {
      component.recipeForm.patchValue({ title: '' });

      component.onSubmit();

      expect(component.recipeForm.get('title')?.touched).toBe(true);
    });

    it('should not submit when already submitting', () => {
      component.isSubmitting = true;

      component.onSubmit();

      expect(recipeServiceMock.create).not.toHaveBeenCalled();
    });

    it('should call create when not in edit mode', () => {
      component.isEditMode = false;
      recipeServiceMock.create.mockReturnValue(of(mockRecipe));

      component.onSubmit();

      expect(recipeServiceMock.create).toHaveBeenCalled();
      expect(recipeServiceMock.update).not.toHaveBeenCalled();
    });

    it('should call update when in edit mode', () => {
      component.isEditMode = true;
      component.recipeId = 1;
      recipeServiceMock.update.mockReturnValue(of(mockRecipe));

      component.onSubmit();

      expect(recipeServiceMock.update).toHaveBeenCalledWith(1, expect.any(Object));
      expect(recipeServiceMock.create).not.toHaveBeenCalled();
    });

    it('should include userId from loginService', () => {
      loginServiceMock.getCurrentUserId.mockReturnValue(42);
      recipeServiceMock.create.mockReturnValue(of(mockRecipe));

      component.onSubmit();

      expect(recipeServiceMock.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 42 })
      );
    });

    it('should navigate to recipes list after successful creation', async () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      component.isEditMode = false;
      recipeServiceMock.create.mockReturnValue(of(mockRecipe));

      component.onSubmit();

      await new Promise(resolve => setTimeout(resolve, 0));
      expect(routerMock.navigate).toHaveBeenCalledWith(['/recipes']);
      consoleLogSpy.mockRestore();
    });

    it('should navigate to view page after successful update', async () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      component.isEditMode = true;
      component.recipeId = 1;
      recipeServiceMock.update.mockReturnValue(of(mockRecipe));

      component.onSubmit();

      await new Promise(resolve => setTimeout(resolve, 0));
      expect(routerMock.navigate).toHaveBeenCalledWith(['/recipes/view', 1]);
      consoleLogSpy.mockRestore();
    });

    it('should set isSubmitting to true during submission', () => {
      recipeServiceMock.create.mockReturnValue(of(mockRecipe));

      component.onSubmit();

      expect(component.isSubmitting).toBe(true);
    });

    it('should reset isSubmitting on error', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      const error = { error: { message: 'Save failed' } };
      recipeServiceMock.create.mockReturnValue(throwError(() => error));

      component.onSubmit();

      await new Promise(resolve => setTimeout(resolve, 0));
      expect(component.isSubmitting).toBe(false);
      consoleErrorSpy.mockRestore();
      alertSpy.mockRestore();
    });

    it('should handle save error', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      const error = { error: { message: 'Validation error' }, message: 'Save failed' };
      recipeServiceMock.create.mockReturnValue(throwError(() => error));

      component.onSubmit();

      await new Promise(resolve => setTimeout(resolve, 0));
      expect(alertSpy).toHaveBeenCalledWith('Failed to save recipe: Validation error');
      consoleErrorSpy.mockRestore();
      alertSpy.mockRestore();
    });
  });

  describe('onCancel', () => {
    it('should navigate to recipes list when not in edit mode', () => {
      component.isEditMode = false;

      component.onCancel();

      expect(routerMock.navigate).toHaveBeenCalledWith(['/recipes']);
    });

    it('should navigate to view page when in edit mode', () => {
      component.isEditMode = true;
      component.recipeId = 1;

      component.onCancel();

      expect(routerMock.navigate).toHaveBeenCalledWith(['/recipes/view', 1]);
    });
  });

  describe('markFormGroupTouched', () => {
    it('should mark all controls as touched', () => {
      component['markFormGroupTouched'](component.recipeForm);

      Object.keys(component.recipeForm.controls).forEach(key => {
        expect(component.recipeForm.get(key)?.touched).toBe(true);
      });
    });
  });
});
