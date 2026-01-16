import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from './user.model';
import { UserLogin } from './login-form/login.model';
import { UserEdit } from './user-edit-form/user-edit.model';

// Helper to strip sensitive fields from user responses
// Note: HTML sanitization is handled globally by responseSanitizerInterceptor
function stripPasswordHash(user: User & { passwordHash?: string }): User {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = '/api/users';

  constructor(private http: HttpClient) {}

  create(user: User & { password?: string }): Observable<User> {
    return this.http.post<User>(this.apiUrl, user).pipe(map(stripPasswordHash));
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`).pipe(map(stripPasswordHash));
  }

  update(id: number, user: UserEdit | User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user).pipe(map(stripPasswordHash));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
