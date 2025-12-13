import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Recipe } from '../../models/recipe.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-recipe-form',
  standalone: true,
  templateUrl: './recipe-form.html',
  styleUrls: ['./recipe-form.scss'],
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule]
})
export class RecipeFormComponent implements OnInit {

  @Input() recipe: Recipe = {
    id: 0,
    userId: 1,
    title: '',
    description: '',
    instructions: '',
    ingredients: ''
  };

  @Output() save = new EventEmitter<Recipe>();

  constructor() { }

  ngOnInit(): void {}

  submitForm() {
    this.save.emit(this.recipe);
  }
}
