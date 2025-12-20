import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { RecipeService } from '../recipe.service';
import { Recipe } from '../recipe.model';

@Component({
  selector: 'app-recipe-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './recipe-form.component.html',
  styleUrl: './recipe-form.component.scss',
})
export class RecipeFormComponent implements OnInit {
  recipeForm: FormGroup;
  isEditMode = false;
  isViewMode = false;
  recipeId?: number;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private recipeService: RecipeService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.recipeForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(255)]],
      description: [''],
      instructions: [''],
      cookTimeMinutes: [null, [Validators.min(1)]],
      ingredients: [''],
      calories: [null, [Validators.min(0)]],
      protein: [null, [Validators.min(0)]],
      fat: [null, [Validators.min(0)]],
      carbs: [null, [Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    const url = this.router.url;
    this.isViewMode = url.includes('/view/');

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = url.includes('/edit/');
        this.recipeId = +params['id'];
        this.loadRecipe(this.recipeId);
      }
    });
  }

  loadRecipe(id: number): void {
    this.recipeService.getById(id).subscribe({
      next: (recipe) => {
        this.recipeForm.patchValue(recipe);

        if (this.isViewMode) {
          this.recipeForm.disable();
        }
      },
      error: (error) => {
        console.error('Error loading recipe:', error);
        alert('Failed to load recipe');
      }
    });
  }

  onEdit(): void {
    if (this.recipeId) {
      this.router.navigate(['/recipes/edit', this.recipeId]);
    }
  }

  onDelete(): void {
    if (!this.recipeId) return;

    const confirmed = confirm('Are you sure you want to delete this recipe? This action cannot be undone.');
    if (!confirmed) return;

    this.recipeService.delete(this.recipeId).subscribe({
      next: () => {
        console.log('Recipe deleted successfully');
        this.router.navigate(['/recipes']);
      },
      error: (error) => {
        console.error('Error deleting recipe:', error);
        alert(`Failed to delete recipe: ${error.error?.message || error.message || 'Unknown error'}`);
      }
    });
  }

  onSubmit(): void {
    if (this.recipeForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const recipeData: Recipe = {
        ...this.recipeForm.value,
        userId: 1 // TODO: Replace with actual logged-in user ID from auth service
      };

      const operation = this.isEditMode && this.recipeId
        ? this.recipeService.update(this.recipeId, recipeData)
        : this.recipeService.create(recipeData);

      operation.subscribe({
        next: (response) => {
          console.log('Recipe saved successfully:', response);
          if (this.isEditMode && this.recipeId) {
            this.router.navigate(['/recipes/view', this.recipeId]);
          } else {
            this.router.navigate(['/recipes']);
          }
        },
        error: (error) => {
          console.error('Error saving recipe:', error);
          console.error('Error details:', {
            status: error.status,
            statusText: error.statusText,
            message: error.error?.message || error.message,
            url: error.url
          });
          alert(`Failed to save recipe: ${error.error?.message || error.message || 'Unknown error'}`);
          this.isSubmitting = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.recipeForm);
    }
  }

  onCancel(): void {
    if (this.isEditMode && this.recipeId) {
      this.router.navigate(['/recipes/view', this.recipeId]);
    } else {
      this.router.navigate(['/recipes']);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}
