import { Recipe } from '../feature/recipe/recipe.model';


export interface SortStrategy {
  sort(recipes: Recipe[]): Recipe[];
}

export class SortByTitleStrategy implements SortStrategy {
  sort(recipes: Recipe[]): Recipe[] {
    return [...recipes].sort((a, b) =>
      a.title.localeCompare(b.title)
    );
  }
}

export class SortByCookTimeStrategy implements SortStrategy {
  sort(recipes: Recipe[]): Recipe[] {
    return [...recipes].sort((a, b) =>
      (a.cookTimeMinutes || 0) - (b.cookTimeMinutes || 0)
    );
  }
}

export class SortByCaloriesStrategy implements SortStrategy {
  sort(recipes: Recipe[]): Recipe[] {
    return [...recipes].sort((a, b) =>
      (a.calories || 0) - (b.calories || 0)
    );
  }
}


export class RecipeSorter {
  private strategy: SortStrategy;

  constructor(strategy: SortStrategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy: SortStrategy): void {
    this.strategy = strategy;
  }

  sortRecipes(recipes: Recipe[]): Recipe[] {
    return this.strategy.sort(recipes);
  }
}
