import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Recipe } from './recipe.model';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private readonly apiUrl = '/api/recipe';

  constructor(private http: HttpClient) {}

  getById(id: number): Observable<Recipe> {
    return this.http.get<Recipe>(`${this.apiUrl}/${id}`);
  }

  getRecipesByIds(ids: number[]): Observable<Recipe[]> {
    const requests = ids.map(id =>
      this.http.get<Recipe>(`${this.apiUrl}/${id}`).pipe(
        catchError(error => {
          console.error(`Failed to load recipe ${id}:`, error);
          return of(null);
        })
      )
    );

    return forkJoin(requests).pipe(
      map(recipes => recipes.filter((recipe): recipe is Recipe => recipe !== null))
    );
  }

  create(recipe: Recipe): Observable<Recipe> {
    return this.http.post<Recipe>(this.apiUrl, recipe);
  }

  update(id: number, recipe: Recipe): Observable<Recipe> {
    return this.http.put<Recipe>(`${this.apiUrl}/${id}`, recipe);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getRecipesByUserId(userId: number): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(`/api/recipe/users/${userId}`);
  }
}
