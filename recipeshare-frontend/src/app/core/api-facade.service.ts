import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserService } from '../feature/user/user.service';
import { RecipeService } from '../feature/recipe/recipe.service';
import { LoginService } from '../feature/user/login-form/login.service';
import { User } from '../feature/user/user.model';
import { Recipe } from '../feature/recipe/recipe.model';


@Injectable({
  providedIn: 'root'
})
export class ApiFacade {
  constructor(
    private userService: UserService,
    private recipeService: RecipeService,
    private loginService: LoginService
  ) {}

  
  getCurrentUser(): Observable<User> {
    const userId = this.loginService.getCurrentUserId();
    if (!userId) {
      throw new Error('No user logged in');
    }
    return this.userService.getById(userId);
  }

  updateCurrentUser(updates: Partial<User>): Observable<User> {
    const userId = this.loginService.getCurrentUserId();
    if (!userId) {
      throw new Error('No user logged in');
    }
    return this.userService.update(userId, updates);
  }

  
  getCurrentUserRecipes(): Observable<Recipe[]> {
    const userId = this.loginService.getCurrentUserId();
    if (!userId) {
      throw new Error('No user logged in');
    }
    return this.recipeService.getRecipesByUserId(userId);
  }

  logout(): void {
    this.loginService.logout();
  }
}
