import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RecipeService } from '../recipe.service';
import { Recipe } from '../recipe.model';
import { LoginService } from '../../user/login-form/login.service';

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

  constructor(
    private recipeService: RecipeService,
    private loginService: LoginService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadRecipes();
  }

  loadRecipes(): void {
    this.isLoading = true;
    this.error = null;

    const userId = this.loginService.getCurrentUserId();
    
    if (!userId) {
      this.router.navigate(['/login']);
      return;
    }

    this.recipeService.getRecipesByUserId(userId).subscribe({
      next: (recipes) => {
        this.recipes = recipes;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading recipes:', error);
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
}
