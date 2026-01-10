import {
  SortStrategy,
  SortByTitleStrategy,
  SortByCookTimeStrategy,
  SortByCaloriesStrategy,
  RecipeSorter
} from './sort-strategy.service';
import { Recipe } from '../feature/recipe/recipe.model';

describe('Sort Strategy Pattern', () => {
  let recipes: Recipe[];

  beforeEach(() => {
    recipes = [
      {
        id: 1,
        title: 'Zeljanica',
        cookTimeMinutes: 60,
        calories: 500,
        description: 'Test recipe 1',
        instructions: 'Test instructions 1'
      },
      {
        id: 2,
        title: 'Ananas kocke',
        cookTimeMinutes: 30,
        calories: 300,
        description: 'Test recipe 2',
        instructions: 'Test instructions 2'
      },
      {
        id: 3,
        title: 'Marinirana piletina',
        cookTimeMinutes: 5,
        calories: 150,
        description: 'Test recipe 3',
        instructions: 'Test instructions 3'
      },
      {
        id: 4,
        title: 'Pita sa sirom',
        cookTimeMinutes: 45,
        calories: 400,
        description: 'Test recipe 4',
        instructions: 'Test instructions 4'
      }
    ];
  });

  describe('SortByTitleStrategy', () => {
    let strategy: SortByTitleStrategy;

    beforeEach(() => {
      strategy = new SortByTitleStrategy();
    });

    it('should create strategy', () => {
      expect(strategy).toBeTruthy();
    });

    it('should not modify original array', () => {
      const originalOrder = recipes.map(r => r.title);
      strategy.sort(recipes);

      expect(recipes.map(r => r.title)).toEqual(originalOrder);
    });

    it('should handle empty array', () => {
      const sorted = strategy.sort([]);

      expect(sorted).toEqual([]);
    });

    it('should handle single item array', () => {
      const singleRecipe = [recipes[0]];
      const sorted = strategy.sort(singleRecipe);

      expect(sorted).toEqual(singleRecipe);
    });

    it('should handle case-insensitive sorting', () => {
      const testRecipes: Recipe[] = [
        { title: 'zebra', description: 'test' },
        { title: 'Apple', description: 'test' },
        { title: 'BANANA', description: 'test' }
      ];

      const sorted = strategy.sort(testRecipes);

      expect(sorted[0].title).toBe('Apple');
      expect(sorted[1].title).toBe('BANANA');
      expect(sorted[2].title).toBe('zebra');
    });

    it('should handle special characters in titles', () => {
      const testRecipes: Recipe[] = [
        { title: 'Recipe #3', description: 'test' },
        { title: 'Recipe @1', description: 'test' },
        { title: 'Recipe !2', description: 'test' }
      ];

      const sorted = strategy.sort(testRecipes);

      expect(sorted.length).toBe(3);
      expect(sorted.every(r => r.title.startsWith('Recipe'))).toBe(true);
    });
  });

  describe('SortByCookTimeStrategy', () => {
    let strategy: SortByCookTimeStrategy;

    beforeEach(() => {
      strategy = new SortByCookTimeStrategy();
    });

    it('should create strategy', () => {
      expect(strategy).toBeTruthy();
    });

    it('should sort recipes by cook time in ascending order', () => {
      const sorted = strategy.sort(recipes);

      expect(sorted[0].cookTimeMinutes).toBe(5);
      expect(sorted[1].cookTimeMinutes).toBe(30);
      expect(sorted[2].cookTimeMinutes).toBe(45);
      expect(sorted[3].cookTimeMinutes).toBe(60);
    });

    it('should not modify original array', () => {
      const originalOrder = recipes.map(r => r.cookTimeMinutes);
      strategy.sort(recipes);

      expect(recipes.map(r => r.cookTimeMinutes)).toEqual(originalOrder);
    });

    it('should handle empty array', () => {
      const sorted = strategy.sort([]);

      expect(sorted).toEqual([]);
    });

    it('should handle single item array', () => {
      const singleRecipe = [recipes[0]];
      const sorted = strategy.sort(singleRecipe);

      expect(sorted).toEqual(singleRecipe);
    });

    it('should handle recipes with same cook time', () => {
      const testRecipes: Recipe[] = [
        { title: 'Recipe A', cookTimeMinutes: 30, description: 'test' },
        { title: 'Recipe B', cookTimeMinutes: 30, description: 'test' },
        { title: 'Recipe C', cookTimeMinutes: 30, description: 'test' }
      ];

      const sorted = strategy.sort(testRecipes);

      expect(sorted.every(r => r.cookTimeMinutes === 30)).toBe(true);
    });
  });

  describe('SortByCaloriesStrategy', () => {
    let strategy: SortByCaloriesStrategy;

    beforeEach(() => {
      strategy = new SortByCaloriesStrategy();
    });

    it('should create strategy', () => {
      expect(strategy).toBeTruthy();
    });

    it('should sort recipes by calories in ascending order', () => {
      const sorted = strategy.sort(recipes);

      expect(sorted[0].calories).toBe(150);
      expect(sorted[1].calories).toBe(300);
      expect(sorted[2].calories).toBe(400);
      expect(sorted[3].calories).toBe(500);
    });

    it('should not modify original array', () => {
      const originalOrder = recipes.map(r => r.calories);
      strategy.sort(recipes);

      expect(recipes.map(r => r.calories)).toEqual(originalOrder);
    });

    it('should handle empty array', () => {
      const sorted = strategy.sort([]);

      expect(sorted).toEqual([]);
    });

    it('should handle single item array', () => {
      const singleRecipe = [recipes[0]];
      const sorted = strategy.sort(singleRecipe);

      expect(sorted).toEqual(singleRecipe);
    });

    it('should handle recipes with same calories', () => {
      const testRecipes: Recipe[] = [
        { title: 'Recipe A', calories: 200, description: 'test' },
        { title: 'Recipe B', calories: 200, description: 'test' },
        { title: 'Recipe C', calories: 200, description: 'test' }
      ];

      const sorted = strategy.sort(testRecipes);

      expect(sorted.every(r => r.calories === 200)).toBe(true);
    });
  });

  describe('RecipeSorter', () => {
    let sorter: RecipeSorter;
    let titleStrategy: SortByTitleStrategy;
    let cookTimeStrategy: SortByCookTimeStrategy;
    let caloriesStrategy: SortByCaloriesStrategy;

    beforeEach(() => {
      titleStrategy = new SortByTitleStrategy();
      cookTimeStrategy = new SortByCookTimeStrategy();
      caloriesStrategy = new SortByCaloriesStrategy();
      sorter = new RecipeSorter(titleStrategy);
    });

    it('should create sorter with initial strategy', () => {
      expect(sorter).toBeTruthy();
    });

    it('should allow changing strategy at runtime', () => {
      sorter.setStrategy(cookTimeStrategy);
      const sorted = sorter.sortRecipes(recipes);

      expect(sorted[0].cookTimeMinutes).toBe(5);
      expect(sorted[3].cookTimeMinutes).toBe(60);
    });

    it('should handle empty array with any strategy', () => {
      const emptyArray: Recipe[] = [];

      sorter.setStrategy(titleStrategy);
      expect(sorter.sortRecipes(emptyArray)).toEqual([]);

      sorter.setStrategy(cookTimeStrategy);
      expect(sorter.sortRecipes(emptyArray)).toEqual([]);

      sorter.setStrategy(caloriesStrategy);
      expect(sorter.sortRecipes(emptyArray)).toEqual([]);
    });

    it('should not modify original array', () => {
      const originalOrder = recipes.map(r => r.title);

      sorter.setStrategy(titleStrategy);
      sorter.sortRecipes(recipes);

      sorter.setStrategy(cookTimeStrategy);
      sorter.sortRecipes(recipes);

      sorter.setStrategy(caloriesStrategy);
      sorter.sortRecipes(recipes);

      expect(recipes.map(r => r.title)).toEqual(originalOrder);
    });
  });

  describe('Strategy Pattern Integration', () => {
    it('should allow custom strategy implementation', () => {
      // Create a custom strategy that sorts by description length
      class SortByDescriptionLengthStrategy implements SortStrategy {
        sort(recipes: Recipe[]): Recipe[] {
          return [...recipes].sort((a, b) =>
            (a.description?.length || 0) - (b.description?.length || 0)
          );
        }
      }

      const customStrategy = new SortByDescriptionLengthStrategy();
      const sorter = new RecipeSorter(customStrategy);

      const sorted = sorter.sortRecipes(recipes);

      expect(sorted.length).toBe(recipes.length);
    });

  });
});
