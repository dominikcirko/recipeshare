import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RecipesService } from '../../services/recipes.service';
import { Recipe } from '../../models/recipe.model';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-recipe-details',
  standalone: true,
  templateUrl: './recipe-details.html',
  styleUrls: ['./recipe-details.scss'],
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule]
})
export class RecipeDetailsComponent implements OnInit {

  recipe: Recipe | null = null;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private recipesService: RecipesService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.recipesService.getRecipes().subscribe(recipes => {
      this.recipe = recipes.find(r => r.id === id) || null;
      if (!this.recipe) {
        alert('Recipe not found');
        this.router.navigate(['/recipes']);
      }
    });
  }
}
