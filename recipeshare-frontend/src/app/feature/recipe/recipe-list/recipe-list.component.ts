import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RecipeService } from '../recipe.service';
import { Recipe } from '../recipe.model';
import { LoginService } from '../../user/login-form/login.service';
import { UserService } from '../../user/user.service';
import { User } from '../../user/user.model';

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

  constructor(
    private recipeService: RecipeService,
    private loginService: LoginService,
    private userService: UserService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadRecipes();
  }

  loadCurrentUser(): void {
    const userId = this.loginService.getCurrentUserId();

    if (!userId) {
      this.router.navigate(['/login']);
      return;
    }

    this.userService.getById(userId).subscribe({
      next: (user) => {
        this.currentUser = user;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading user:', error);
      }
    });
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

  onProfileClick(): void {
    if (this.currentUser?.id) {
      this.router.navigate(['/user/edit', this.currentUser.id]);
    }
  }

  getAvatarUrl(): string {
    return this.currentUser?.avatarUrl || this.defaultAvatarUrl;
  }
}
