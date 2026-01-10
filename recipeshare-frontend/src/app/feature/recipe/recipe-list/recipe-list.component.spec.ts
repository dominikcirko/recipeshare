import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError, Subject } from 'rxjs';
import { RecipeListComponent } from './recipe-list.component';
import { ApiFacade } from '../../../core/api-facade.service';
import { Logger } from '../../../core/logger.service';
import { Recipe } from '../recipe.model';
import { User } from '../../user/user.model';
import { provideRouter } from '@angular/router';

describe('RecipeListComponent', () => {
  let component: RecipeListComponent;
  let fixture: ComponentFixture<RecipeListComponent>;
  let apiFacadeMock: any;
  let routerMock: any;
  let loggerMock: any;

  const mockUser: User = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    bio: 'Test bio',
    avatarUrl: 'https://example.com/avatar.jpg'
  };

  const mockRecipes: Recipe[] = [
    {
      id: 1,
      userId: 1,
      title: 'Zebra Cake',
      description: 'A delicious cake',
      instructions: 'Mix and bake',
      cookTimeMinutes: 60,
      ingredients: 'Flour, Sugar',
      calories: 500,
      protein: 20,
      fat: 15,
      carbs: 50
    },
    {
      id: 2,
      userId: 1,
      title: 'Apple Pie',
      description: 'Classic apple pie',
      instructions: 'Bake apples',
      cookTimeMinutes: 30,
      ingredients: 'Apples, Flour',
      calories: 300,
      protein: 10,
      fat: 10,
      carbs: 40
    },
    {
      id: 3,
      userId: 1,
      title: 'Mango Smoothie',
      description: 'Refreshing smoothie',
      instructions: 'Blend ingredients',
      cookTimeMinutes: 5,
      ingredients: 'Mango, Milk',
      calories: 150,
      protein: 5,
      fat: 2,
      carbs: 30
    }
  ];

  beforeEach(async () => {
    // Reset Logger singleton
    // @ts-ignore
    Logger.instance = undefined;

    apiFacadeMock = {
      getCurrentUser: vi.fn().mockReturnValue(of(mockUser)),
      getCurrentUserRecipes: vi.fn().mockReturnValue(of(mockRecipes)),
      updateCurrentUser: vi.fn(),
      logout: vi.fn()
    } as any;

    routerMock = {
      navigate: vi.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [RecipeListComponent],
      providers: [
        { provide: ApiFacade, useValue: apiFacadeMock },
        { provide: Router, useValue: routerMock },
        provideRouter([])
      ]
    }).compileComponents();

    // Mock Logger methods
    loggerMock = Logger.getInstance() as any;
    vi.spyOn(loggerMock, 'log').mockImplementation(() => {});
    vi.spyOn(loggerMock, 'error').mockImplementation(() => {});

    fixture = TestBed.createComponent(RecipeListComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    // Clean up Logger singleton
    // @ts-ignore
    Logger.instance = undefined;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with empty recipes array', () => {
      expect(component.recipes).toEqual([]);
    });

    it('should initialize with isLoading as true', () => {
      expect(component.isLoading).toBe(true);
    });

    it('should initialize with null error', () => {
      expect(component.error).toBeNull();
    });

    it('should initialize with null currentUser', () => {
      expect(component.currentUser).toBeNull();
    });

    it('should initialize logger singleton', () => {
      expect(component['logger']).toBeDefined();
    });

    it('should initialize recipeSorter with SortByTitleStrategy', () => {
      expect(component['recipeSorter']).toBeDefined();
    });
  });

  describe('ngOnInit', () => {
    beforeEach(() => {
      apiFacadeMock.getCurrentUser.mockReturnValue(of(mockUser));
      apiFacadeMock.getCurrentUserRecipes.mockReturnValue(of(mockRecipes));
    });

    it('should log initialization', () => {
      fixture.detectChanges();

      expect(loggerMock.log).toHaveBeenCalledWith('RecipeListComponent initialized');
    });

    it('should call loadCurrentUser', () => {
      const loadCurrentUserSpy = vi.spyOn(component, 'loadCurrentUser');

      fixture.detectChanges();

      expect(loadCurrentUserSpy).toHaveBeenCalled();
    });

    it('should call loadRecipes', () => {
      const loadRecipesSpy = vi.spyOn(component, 'loadRecipes');

      fixture.detectChanges();

      expect(loadRecipesSpy).toHaveBeenCalled();
    });
  });

  describe('loadCurrentUser', () => {
    it('should log loading message', () => {
      apiFacadeMock.getCurrentUser.mockReturnValue(of(mockUser));

      component.loadCurrentUser();

      expect(loggerMock.log).toHaveBeenCalledWith('Loading current user');
    });

    it('should call apiFacade.getCurrentUser', () => {
      apiFacadeMock.getCurrentUser.mockReturnValue(of(mockUser));

      component.loadCurrentUser();

      expect(apiFacadeMock.getCurrentUser).toHaveBeenCalled();
    });

    it('should set currentUser on success', async () => {
      apiFacadeMock.getCurrentUser.mockReturnValue(of(mockUser));

      component.loadCurrentUser();

      await new Promise(resolve => setTimeout(resolve, 0));
      expect(component.currentUser).toEqual(mockUser);
    });

    it('should log error on failure', async () => {
      const error = { message: 'User not found' };
      apiFacadeMock.getCurrentUser.mockReturnValue(throwError(() => error));

      component.loadCurrentUser();

      await new Promise(resolve => setTimeout(resolve, 0));
      expect(loggerMock.error).toHaveBeenCalledWith('Error loading user: User not found');
    });

    it('should navigate to /login on failure', async () => {
      const error = { message: 'User not found' };
      apiFacadeMock.getCurrentUser.mockReturnValue(throwError(() => error));

      component.loadCurrentUser();

      await new Promise(resolve => setTimeout(resolve, 0));
      expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('loadRecipes', () => {
    it('should log loading message', () => {
      apiFacadeMock.getCurrentUserRecipes.mockReturnValue(of(mockRecipes));

      component.loadRecipes();

      expect(loggerMock.log).toHaveBeenCalledWith('Loading recipes');
    });

    it('should set isLoading to true', () => {
      // Use a Subject to delay the observable completion so we can check isLoading
      const subject = new Subject<Recipe[]>();
      apiFacadeMock.getCurrentUserRecipes.mockReturnValue(subject.asObservable());
      component.isLoading = false;

      component.loadRecipes();

      expect(component.isLoading).toBe(true);

      // Clean up
      subject.next(mockRecipes);
      subject.complete();
    });

    it('should clear error', () => {
      apiFacadeMock.getCurrentUserRecipes.mockReturnValue(of(mockRecipes));
      component.error = 'Previous error';

      component.loadRecipes();

      expect(component.error).toBeNull();
    });

    it('should call apiFacade.getCurrentUserRecipes', () => {
      apiFacadeMock.getCurrentUserRecipes.mockReturnValue(of(mockRecipes));

      component.loadRecipes();

      expect(apiFacadeMock.getCurrentUserRecipes).toHaveBeenCalled();
    });

    it('should set recipes on success', async () => {
      apiFacadeMock.getCurrentUserRecipes.mockReturnValue(of(mockRecipes));

      component.loadRecipes();

      await new Promise(resolve => setTimeout(resolve, 0));
      expect(component.recipes).toEqual(mockRecipes);
    });

    it('should set isLoading to false on success', async () => {
      apiFacadeMock.getCurrentUserRecipes.mockReturnValue(of(mockRecipes));

      component.loadRecipes();

      await new Promise(resolve => setTimeout(resolve, 0));
      expect(component.isLoading).toBe(false);
    });

    it('should log loaded recipes count', async () => {
      apiFacadeMock.getCurrentUserRecipes.mockReturnValue(of(mockRecipes));

      component.loadRecipes();

      await new Promise(resolve => setTimeout(resolve, 0));
      expect(loggerMock.log).toHaveBeenCalledWith(`Loaded ${mockRecipes.length} recipes`);
    });

    it('should log error on failure', async () => {
      const error = { message: 'Failed to fetch' };
      apiFacadeMock.getCurrentUserRecipes.mockReturnValue(throwError(() => error));

      component.loadRecipes();

      await new Promise(resolve => setTimeout(resolve, 0));
      expect(loggerMock.error).toHaveBeenCalledWith('Error loading recipes: Failed to fetch');
    });

    it('should set error message on failure', async () => {
      const error = { message: 'Failed to fetch' };
      apiFacadeMock.getCurrentUserRecipes.mockReturnValue(throwError(() => error));

      component.loadRecipes();

      await new Promise(resolve => setTimeout(resolve, 0));
      expect(component.error).toBe('Failed to load recipes');
    });

    it('should set isLoading to false on failure', async () => {
      const error = { message: 'Failed to fetch' };
      apiFacadeMock.getCurrentUserRecipes.mockReturnValue(throwError(() => error));

      component.loadRecipes();

      await new Promise(resolve => setTimeout(resolve, 0));
      expect(component.isLoading).toBe(false);
    });

    it('should handle empty recipes array', async () => {
      apiFacadeMock.getCurrentUserRecipes.mockReturnValue(of([]));

      component.loadRecipes();

      await new Promise(resolve => setTimeout(resolve, 0));
      expect(component.recipes).toEqual([]);
      expect(loggerMock.log).toHaveBeenCalledWith('Loaded 0 recipes');
    });
  });

  describe('onRecipeClick', () => {
    it('should navigate to recipe view page', () => {
      const recipeId = 1;

      component.onRecipeClick(recipeId);

      expect(routerMock.navigate).toHaveBeenCalledWith(['/recipes/view', recipeId]);
    });

    it('should handle different recipe ids', () => {
      const recipeIds = [1, 5, 100];

      recipeIds.forEach(id => {
        component.onRecipeClick(id);
        expect(routerMock.navigate).toHaveBeenCalledWith(['/recipes/view', id]);
      });
    });
  });

  describe('onCreateNew', () => {
    it('should navigate to new recipe page', () => {
      component.onCreateNew();

      expect(routerMock.navigate).toHaveBeenCalledWith(['/recipes/new']);
    });
  });

  describe('onProfileClick', () => {
    it('should navigate to user edit page when currentUser exists', () => {
      component.currentUser = mockUser;

      component.onProfileClick();

      expect(routerMock.navigate).toHaveBeenCalledWith(['/user/edit', mockUser.id]);
    });

    it('should not navigate when currentUser is null', () => {
      component.currentUser = null;

      component.onProfileClick();

      expect(routerMock.navigate).not.toHaveBeenCalled();
    });

    it('should not navigate when currentUser has no id', () => {
      component.currentUser = { ...mockUser, id: undefined } as any;

      component.onProfileClick();

      expect(routerMock.navigate).not.toHaveBeenCalled();
    });
  });

  describe('getAvatarUrl', () => {
    it('should return user avatarUrl when available', () => {
      component.currentUser = mockUser;

      const avatarUrl = component.getAvatarUrl();

      expect(avatarUrl).toBe(mockUser.avatarUrl);
    });

    it('should return default avatarUrl when currentUser is null', () => {
      component.currentUser = null;

      const avatarUrl = component.getAvatarUrl();

      expect(avatarUrl).toBe(component.defaultAvatarUrl);
    });

    it('should return default avatarUrl when user has no avatarUrl', () => {
      component.currentUser = { ...mockUser, avatarUrl: undefined };

      const avatarUrl = component.getAvatarUrl();

      expect(avatarUrl).toBe(component.defaultAvatarUrl);
    });

    it('should return default avatarUrl when user avatarUrl is empty', () => {
      component.currentUser = { ...mockUser, avatarUrl: '' };

      const avatarUrl = component.getAvatarUrl();

      expect(avatarUrl).toBe(component.defaultAvatarUrl);
    });
  });

  describe('sortByTitle', () => {
    beforeEach(() => {
      component.recipes = [...mockRecipes];
    });

    it('should log sorting message', () => {
      component.sortByTitle();

      expect(loggerMock.log).toHaveBeenCalledWith('Sorting recipes by title');
    });

    it('should sort recipes alphabetically by title', () => {
      component.sortByTitle();

      expect(component.recipes[0].title).toBe('Apple Pie');
      expect(component.recipes[1].title).toBe('Mango Smoothie');
      expect(component.recipes[2].title).toBe('Zebra Cake');
    });

    it('should handle empty recipes array', () => {
      component.recipes = [];

      component.sortByTitle();

      expect(component.recipes).toEqual([]);
    });
  });

  describe('sortByCookTime', () => {
    beforeEach(() => {
      component.recipes = [...mockRecipes];
    });

    it('should log sorting message', () => {
      component.sortByCookTime();

      expect(loggerMock.log).toHaveBeenCalledWith('Sorting recipes by cook time');
    });

    it('should sort recipes by cook time ascending', () => {
      component.sortByCookTime();

      expect(component.recipes[0].cookTimeMinutes).toBe(5);
      expect(component.recipes[1].cookTimeMinutes).toBe(30);
      expect(component.recipes[2].cookTimeMinutes).toBe(60);
    });

    it('should handle empty recipes array', () => {
      component.recipes = [];

      component.sortByCookTime();

      expect(component.recipes).toEqual([]);
    });
  });

  describe('sortByCalories', () => {
    beforeEach(() => {
      component.recipes = [...mockRecipes];
    });

    it('should log sorting message', () => {
      component.sortByCalories();

      expect(loggerMock.log).toHaveBeenCalledWith('Sorting recipes by calories');
    });

    it('should sort recipes by calories ascending', () => {
      component.sortByCalories();

      expect(component.recipes[0].calories).toBe(150);
      expect(component.recipes[1].calories).toBe(300);
      expect(component.recipes[2].calories).toBe(500);
    });

    it('should handle empty recipes array', () => {
      component.recipes = [];

      component.sortByCalories();

      expect(component.recipes).toEqual([]);
    });
  });

  describe('Sorting Integration', () => {
    beforeEach(() => {
      component.recipes = [...mockRecipes];
    });

    it('should allow switching between different sorting strategies', () => {
      // Sort by title
      component.sortByTitle();
      expect(component.recipes[0].title).toBe('Apple Pie');

      // Sort by cook time
      component.sortByCookTime();
      expect(component.recipes[0].cookTimeMinutes).toBe(5);

      // Sort by calories
      component.sortByCalories();
      expect(component.recipes[0].calories).toBe(150);

      // Sort by title again
      component.sortByTitle();
      expect(component.recipes[0].title).toBe('Apple Pie');
    });

    it('should maintain recipe data integrity after sorting', () => {
      const originalRecipeIds = mockRecipes.map(r => r.id).sort();

      component.sortByTitle();
      component.sortByCookTime();
      component.sortByCalories();

      const sortedRecipeIds = component.recipes.map(r => r.id).sort();
      expect(sortedRecipeIds).toEqual(originalRecipeIds);
    });
  });

  describe('Logger Integration', () => {
    beforeEach(() => {
      apiFacadeMock.getCurrentUser.mockReturnValue(of(mockUser));
      apiFacadeMock.getCurrentUserRecipes.mockReturnValue(of(mockRecipes));
    });

    it('should use Logger singleton consistently', () => {
      const logger1 = Logger.getInstance();
      const logger2 = Logger.getInstance();

      expect(logger1).toBe(logger2);
      expect(component['logger']).toBe(logger1);
    });

    it('should log all lifecycle events', () => {
      fixture.detectChanges();

      expect(loggerMock.log).toHaveBeenCalledWith('RecipeListComponent initialized');
      expect(loggerMock.log).toHaveBeenCalledWith('Loading current user');
      expect(loggerMock.log).toHaveBeenCalledWith('Loading recipes');
    });
  });

  describe('Edge Cases', () => {
    it('should handle recipes with undefined cook time when sorting', () => {
      component.recipes = [
        { ...mockRecipes[0], cookTimeMinutes: undefined },
        { ...mockRecipes[1], cookTimeMinutes: 30 },
        { ...mockRecipes[2], cookTimeMinutes: 5 }
      ];

      component.sortByCookTime();

      // Undefined is treated as 0 for sorting, but the value remains undefined
      expect(component.recipes[0].cookTimeMinutes).toBeUndefined();
      expect(component.recipes[1].cookTimeMinutes).toBe(5);
      expect(component.recipes[2].cookTimeMinutes).toBe(30);
    });

    it('should handle recipes with undefined calories when sorting', () => {
      component.recipes = [
        { ...mockRecipes[0], calories: undefined },
        { ...mockRecipes[1], calories: 300 },
        { ...mockRecipes[2], calories: 150 }
      ];

      component.sortByCalories();

      // Undefined is treated as 0 for sorting, but the value remains undefined
      expect(component.recipes[0].calories).toBeUndefined();
      expect(component.recipes[1].calories).toBe(150);
      expect(component.recipes[2].calories).toBe(300);
    });
  });
});
