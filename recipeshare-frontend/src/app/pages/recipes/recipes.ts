import { Component, OnInit } from '@angular/core';
import { RecipesService } from '../../services/recipes.service';
import { Recipe } from '../../models/recipe.model';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { RecipeFormComponent } from '../recipe-form/recipe-form';

@Component({
  selector: 'app-recipes',
  standalone: true,
  templateUrl: './recipes.html',
  styleUrls: ['./recipes.scss'],
  imports: [CommonModule, MatCardModule, MatButtonModule, RouterModule, RecipeFormComponent]
})
export class RecipesComponent implements OnInit {

  recipes: Recipe[] = [];
  editingRecipe: Recipe | null = null;
  showForm = false;

  constructor(private recipesService: RecipesService) {}

  ngOnInit(): void {
    this.loadRecipes();
  }

  loadRecipes() {
    this.recipesService.getRecipes().subscribe(data => this.recipes = data);
  }

  createRecipe() {
    this.editingRecipe = {
      id: 0,
      userId: 1,
      title: '',
      description: '',
      instructions: '',
      ingredients: ''
    };
    this.showForm = true;
  }

  editRecipe(recipe: Recipe) {
    this.editingRecipe = { ...recipe }; // copy to avoid direct mutation
    this.showForm = true;
  }

  saveRecipe(recipe: Recipe) {
    if (recipe.id === 0) {
      // Create new recipe (mock)
      recipe.id = Math.max(...this.recipes.map(r => r.id), 0) + 1;
      this.recipes.push(recipe);
    } else {
      // Update existing
      const index = this.recipes.findIndex(r => r.id === recipe.id);
      if (index >= 0) this.recipes[index] = recipe;
    }
    this.showForm = false;
  }

  cancelForm() {
    this.showForm = false;
  }

  deleteRecipe(recipe: Recipe) {
    const confirmDelete = confirm(`Are you sure you want to delete "${recipe.title}"?`);
    if (!confirmDelete) return;

    this.recipes = this.recipes.filter(r => r.id !== recipe.id);
  }
}
