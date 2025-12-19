import { Routes } from '@angular/router';
import { LoginComponent } from './feature/user/login-form/login-form.component';
import { RegisterComponent } from './feature/user/register-form/register-form.component';
import { RecipeFormComponent } from './feature/recipe/recipe-form/recipe-form.component';
import { RecipeListComponent } from './feature/recipe/recipe-list/recipe-list.component';

export const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'recipes', component: RecipeListComponent },
  { path: 'recipes/new', component: RecipeFormComponent },
  { path: 'recipes/edit/:id', component: RecipeFormComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];