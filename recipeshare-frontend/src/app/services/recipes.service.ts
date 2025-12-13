import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Recipe } from '../models/recipe.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RecipesService {

  private MOCK_RECIPES: Recipe[] = [
    {
      id: 1,
      userId: 1,
      title: 'Spaghetti Bolognese',
      description: 'Classic Italian pasta',
      instructions: 'Cook pasta, prepare sauce, mix together',
      cookTimeMinutes: 30,
      ingredients: 'Pasta, tomato sauce, minced meat',
      calories: 600,
      protein: 25,
      fat: 20,
      carbs: 80
    },
    {
      id: 2,
      userId: 1,
      title: 'Chicken Salad',
      description: 'Healthy green salad',
      instructions: 'Mix chicken with greens and dressing',
      cookTimeMinutes: 15,
      ingredients: 'Chicken, lettuce, tomatoes, dressing',
      calories: 350,
      protein: 30,
      fat: 10,
      carbs: 20
    }
  ];

  constructor(private auth: AuthService) {}

  getRecipes(): Observable<Recipe[]> {
    const currentUser = this.auth.getCurrentUser();
    if (!currentUser) return of([]);
    const userRecipes = this.MOCK_RECIPES.filter(r => r.userId === currentUser.id);
    return of(userRecipes);
  }
}
