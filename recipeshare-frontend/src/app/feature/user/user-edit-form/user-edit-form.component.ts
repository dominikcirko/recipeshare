import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../user.service';
import { User } from '../user.model';
import { UserEdit } from './user-edit.model';

@Component({
  selector: 'app-user-edit-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-edit-form.component.html',
  styleUrl: './user-edit-form.component.scss'
})
export class UserEditFormComponent implements OnInit {
  userForm: FormGroup;
  userId: number | null = null;
  isLoading = true;
  error: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      bio: [''],
      avatarUrl: ['']
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.userId = +params['id'];
      if (this.userId) {
        this.loadUser();
      }
    });
  }

  loadUser(): void {
    if (!this.userId) {
      console.error('No user ID provided');
      this.error = 'No user ID provided';
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    console.log('Loading user with ID:', this.userId);
    this.isLoading = true;
    this.cdr.detectChanges();
    this.userService.getById(this.userId).subscribe({
      next: (user: User) => {
        console.log('User loaded successfully:', user);
        this.userForm.patchValue({
          username: user.username,
          email: user.email,
          bio: user.bio || '',
          avatarUrl: user.avatarUrl || ''
        });
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading user:', error);
        this.error = 'Failed to load user data. Please try again later.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid || !this.userId) return;

    const updatedUser: UserEdit = {
      username: this.userForm.value.username,
      email: this.userForm.value.email,
      bio: this.userForm.value.bio || '',
      avatarUrl: this.userForm.value.avatarUrl || ''
    };
    console.log('Submitting user update:', updatedUser);
    console.log('User ID:', this.userId);

    this.userService.update(this.userId, updatedUser).subscribe({
      next: () => {
        this.successMessage = 'Profile updated successfully!';
        setTimeout(() => {
          this.router.navigate(['/recipes']);
        }, 2000);
      },
      error: (error) => {
        console.error('Error updating user:', error);
        this.error = 'Failed to update profile';
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/recipes']);
  }
}
