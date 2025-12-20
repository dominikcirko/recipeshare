import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LoginService } from './login.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';

  constructor(
    private loginService: LoginService,
    private router: Router
  ) {}

onSubmit(): void {
  this.error = '';
  
  this.loginService.login({ 
    email: this.email, 
    password: this.password 
  }).subscribe({
    next: () => {
      this.router.navigate(['/recipes'])
    },
    error: (err) => {
      this.error = 'Invalid credentials';
      console.error('Login failed:', err);
    }
  });
}
}