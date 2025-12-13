import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { RecipesComponent } from './pages/recipes/recipes';
import { authGuard } from './guards/auth.guard';
import { RecipeDetailsComponent } from './pages/recipe-details/recipe-details';


export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'recipes', component: RecipesComponent, canActivate: [authGuard] },
  { path: 'recipes/:id', component: RecipeDetailsComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' }
];