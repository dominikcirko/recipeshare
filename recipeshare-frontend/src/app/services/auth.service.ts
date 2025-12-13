import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

export interface User {
  id: number;
  username: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly MOCK_USER: User = {
    id: 1,
    username: 'dominik',
    email: 'dominik@example.com'
  };

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor() { }

  login(email: string, password: string): Observable<User> {
    // Mock login: accepts any email/password
    this.currentUserSubject.next(this.MOCK_USER);
    return of(this.MOCK_USER);
  }

  logout() {
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }
}
