import { Routes } from '@angular/router';
import { LoginComponent } from './feature/user/login-form/login-form.component';
import { RegisterComponent } from './feature/user/register-form/register-form.component';

export const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];