import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Recipe } from '../recipe.model';
import { User } from '../../user/user.model';
import { Logger } from '../../../core/logger.service';
import { ApiFacade } from '../../../core/api-facade.service';
import {
  RecipeSorter,
  SortByTitleStrategy,
  SortByCookTimeStrategy,
  SortByCaloriesStrategy
} from '../../../core/sort-strategy.service';


@Component({
  selector: 'app-recipe-list',
  imports: [CommonModule],
  templateUrl: './recipe-list.component.html',
  styleUrl: './recipe-list.component.scss',
  standalone: true
})
export class RecipeListComponent implements OnInit {
  recipes: Recipe[] = [];
  isLoading = true;
  error: string | null = null;
  currentUser: User | null = null;
  defaultAvatarUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRTJFOEYwIi8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iMzUiIHI9IjE1IiBmaWxsPSIjQTBBRUMwIi8+CjxwYXRoIGQ9Ik0yNSA4MEM2NSA2NSA3MCA2NSAxMDAgODBWMTAwSDI1VjgwWiIgZmlsbD0iI0EwQUVDMCIvPgo8L3N2Zz4=';

  private logger = Logger.getInstance();
  private recipeSorter: RecipeSorter;

  constructor(
    private apiFacade: ApiFacade,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {    
    this.recipeSorter = new RecipeSorter(new SortByTitleStrategy());
  }

  ngOnInit(): void {
    this.logger.log('RecipeListComponent initialized');
    this.loadCurrentUser();
    this.loadRecipes();
  }


  loadCurrentUser(): void {
    this.logger.log('Loading current user');
    this.apiFacade.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.logger.error('Error loading user: ' + error.message);
        this.router.navigate(['/login']);
      }
    });
  }


  loadRecipes(): void {
    this.logger.log('Loading recipes');
    this.isLoading = true;
    this.error = null;

    this.apiFacade.getCurrentUserRecipes().subscribe({
      next: (recipes) => {
        this.recipes = recipes;
        this.isLoading = false;
        this.logger.log(`Loaded ${recipes.length} recipes`);
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.logger.error('Error loading recipes: ' + error.message);
        this.error = 'Failed to load recipes';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }


  onRecipeClick(recipeId: number): void {
    this.router.navigate(['/recipes/view', recipeId]);
  }

  onCreateNew(): void {
    this.router.navigate(['/recipes/new']);
  }

  onProfileClick(): void {
    if (this.currentUser?.id) {
      this.router.navigate(['/user/edit', this.currentUser.id]);
    }
  }

  getAvatarUrl(): string {
    return this.currentUser?.avatarUrl || this.defaultAvatarUrl;
  }


  sortByTitle(): void {
    this.logger.log('Sorting recipes by title');
    this.recipeSorter.setStrategy(new SortByTitleStrategy());
    this.recipes = this.recipeSorter.sortRecipes(this.recipes);
  }

  sortByCookTime(): void {
    this.logger.log('Sorting recipes by cook time');
    this.recipeSorter.setStrategy(new SortByCookTimeStrategy());
    this.recipes = this.recipeSorter.sortRecipes(this.recipes);
  }

  sortByCalories(): void {
    this.logger.log('Sorting recipes by calories');
    this.recipeSorter.setStrategy(new SortByCaloriesStrategy());
    this.recipes = this.recipeSorter.sortRecipes(this.recipes);
  }
}

