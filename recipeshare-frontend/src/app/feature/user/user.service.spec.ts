import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { UserService } from './user.service';
import { User } from './user.model';
import { UserEdit } from './user-edit-form/user-edit.model';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  const mockUser: User = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    bio: 'Test bio',
    avatarUrl: 'https://example.com/avatar.jpg'
  };

  const mockUserEdit: UserEdit = {
    username: 'updateduser',
    email: 'updated@example.com',
    bio: 'Updated bio',
    avatarUrl: 'https://example.com/new-avatar.jpg'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('create', () => {
    it('should send POST request to /api/users with user data', () => {
      const newUser = { ...mockUser, password: 'password123' };

      service.create(newUser).subscribe();

      const req = httpMock.expectOne('/api/users');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newUser);

      req.flush(mockUser);
    });

    it('should return created user on success', async () => {
      const newUser = { ...mockUser, password: 'password123' };

      service.create(newUser).subscribe(user => {
        expect(user).toEqual(mockUser);
      });

      const req = httpMock.expectOne('/api/users');
      req.flush(mockUser);
    });

    it('should handle create error', async () => {
      const newUser = { ...mockUser, password: 'password123' };
      const errorMessage = 'User already exists';

      service.create(newUser).subscribe({
        next: () => expect.fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne('/api/users');
      req.flush(errorMessage, { status: 400, statusText: 'Bad Request' });
    });

    it('should allow creating user without password', () => {
      service.create(mockUser).subscribe();

      const req = httpMock.expectOne('/api/users');
      expect(req.request.body).toEqual(mockUser);

      req.flush(mockUser);
    });
  });

  describe('getById', () => {
    it('should send GET request to /api/users/:id', () => {
      const userId = 1;

      service.getById(userId).subscribe();

      const req = httpMock.expectOne(`/api/users/${userId}`);
      expect(req.request.method).toBe('GET');

      req.flush(mockUser);
    });

    it('should return user by id on success', async () => {
      const userId = 1;

      service.getById(userId).subscribe(user => {
        expect(user).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`/api/users/${userId}`);
      req.flush(mockUser);
    });

    it('should handle get by id error when user not found', async () => {
      const userId = 999;
      const errorMessage = 'User not found';

      service.getById(userId).subscribe({
        next: () => expect.fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`/api/users/${userId}`);
      req.flush(errorMessage, { status: 404, statusText: 'Not Found' });
    });

    it('should work with different user ids', () => {
      const userIds = [1, 5, 100];

      userIds.forEach(id => {
        service.getById(id).subscribe();

        const req = httpMock.expectOne(`/api/users/${id}`);
        expect(req.request.method).toBe('GET');

        req.flush({ ...mockUser, id });
      });
    });
  });

  describe('update', () => {
    it('should send PUT request to /api/users/:id with UserEdit data', () => {
      const userId = 1;

      service.update(userId, mockUserEdit).subscribe();

      const req = httpMock.expectOne(`/api/users/${userId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(mockUserEdit);

      req.flush({ ...mockUser, ...mockUserEdit });
    });

    it('should send PUT request to /api/users/:id with User data', () => {
      const userId = 1;

      service.update(userId, mockUser).subscribe();

      const req = httpMock.expectOne(`/api/users/${userId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(mockUser);

      req.flush(mockUser);
    });

    it('should return updated user on success', async () => {
      const userId = 1;
      const updatedUser = { ...mockUser, ...mockUserEdit };

      service.update(userId, mockUserEdit).subscribe(user => {
        expect(user).toEqual(updatedUser);
      });

      const req = httpMock.expectOne(`/api/users/${userId}`);
      req.flush(updatedUser);
    });

    it('should handle update error', async () => {
      const userId = 1;
      const errorMessage = 'Unauthorized';

      service.update(userId, mockUserEdit).subscribe({
        next: () => expect.fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(403);
        }
      });

      const req = httpMock.expectOne(`/api/users/${userId}`);
      req.flush(errorMessage, { status: 403, statusText: 'Forbidden' });
    });

    it('should handle partial updates', () => {
      const userId = 1;
      const partialUpdate: Partial<UserEdit> = {
        username: 'newusername'
      };

      service.update(userId, partialUpdate as UserEdit).subscribe();

      const req = httpMock.expectOne(`/api/users/${userId}`);
      expect(req.request.body).toEqual(partialUpdate);

      req.flush({ ...mockUser, username: 'newusername' });
    });
  });

  describe('delete', () => {
    it('should send DELETE request to /api/users/:id', () => {
      const userId = 1;

      service.delete(userId).subscribe();

      const req = httpMock.expectOne(`/api/users/${userId}`);
      expect(req.request.method).toBe('DELETE');

      req.flush(null);
    });

    it('should complete successfully on delete', async () => {
      const userId = 1;

      service.delete(userId).subscribe({
        next: () => {
          expect(true).toBe(true);
        },
        error: () => expect.fail('should not have failed')
      });

      const req = httpMock.expectOne(`/api/users/${userId}`);
      req.flush(null);
    });

    it('should handle delete error', async () => {
      const userId = 1;
      const errorMessage = 'Cannot delete user';

      service.delete(userId).subscribe({
        next: () => expect.fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`/api/users/${userId}`);
      req.flush(errorMessage, { status: 500, statusText: 'Internal Server Error' });
    });

    it('should work with different user ids', () => {
      const userIds = [1, 5, 100];

      userIds.forEach(id => {
        service.delete(id).subscribe();

        const req = httpMock.expectOne(`/api/users/${id}`);
        expect(req.request.method).toBe('DELETE');

        req.flush(null);
      });
    });
  });
});
