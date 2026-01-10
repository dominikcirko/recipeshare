import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { UserService } from './user.service';
import { User } from './user.model';

describe('UserService Integration Tests', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  const mockUser: User = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    passwordHash: 'hashed-password',
    bio: 'Test bio',
    avatarUrl: 'https://example.com/avatar.jpg'
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

  describe('CRUD Operations', () => {
    it('should complete create-read-update-delete lifecycle', async () => {
      const newUser: Partial<User> = {
        username: 'newuser',
        email: 'new@example.com',
        passwordHash: 'hashed'
      };

      // Create
      service.create(newUser as any).subscribe();
      const createReq = httpMock.expectOne('/api/users');
      expect(createReq.request.method).toBe('POST');
      createReq.flush({ ...newUser, id: 1 });

      await new Promise(resolve => setTimeout(resolve, 0));

      // Read
      service.getById(1).subscribe();
      const getReq = httpMock.expectOne('/api/users/1');
      expect(getReq.request.method).toBe('GET');
      getReq.flush({ ...newUser, id: 1 });

      await new Promise(resolve => setTimeout(resolve, 0));

      // Update
      service.update(1, { bio: 'Updated bio' }).subscribe();
      const updateReq = httpMock.expectOne('/api/users/1');
      expect(updateReq.request.method).toBe('PUT');
      updateReq.flush({ ...newUser, id: 1, bio: 'Updated bio' });

      await new Promise(resolve => setTimeout(resolve, 0));

      // Delete
      service.delete(1).subscribe();
      const deleteReq = httpMock.expectOne('/api/users/1');
      expect(deleteReq.request.method).toBe('DELETE');
      deleteReq.flush(null);

      await new Promise(resolve => setTimeout(resolve, 0));
    });

    it('should handle sequential user operations', async () => {
      const user1: Partial<User> = { username: 'user1', email: 'user1@example.com', passwordHash: 'hash1' };
      const user2: Partial<User> = { username: 'user2', email: 'user2@example.com', passwordHash: 'hash2' };

      service.create(user1 as any).subscribe();
      const createReq1 = httpMock.expectOne('/api/users');
      createReq1.flush({ ...user1, id: 1 });

      await new Promise(resolve => setTimeout(resolve, 0));

      service.create(user2 as any).subscribe();
      const createReq2 = httpMock.expectOne('/api/users');
      createReq2.flush({ ...user2, id: 2 });

      await new Promise(resolve => setTimeout(resolve, 0));

      service.getById(1).subscribe();
      const getReq1 = httpMock.expectOne('/api/users/1');
      getReq1.flush({ ...user1, id: 1 });

      await new Promise(resolve => setTimeout(resolve, 0));

      service.getById(2).subscribe();
      const getReq2 = httpMock.expectOne('/api/users/2');
      getReq2.flush({ ...user2, id: 2 });

      await new Promise(resolve => setTimeout(resolve, 0));
    });
  });

  describe('Update Operations', () => {
    it('should handle partial updates', async () => {
      service.update(1, { bio: 'New bio' }).subscribe();

      const req = httpMock.expectOne('/api/users/1');
      expect(req.request.body).toEqual({ bio: 'New bio' });
      req.flush({ ...mockUser, bio: 'New bio' });

      await new Promise(resolve => setTimeout(resolve, 0));
    });

    it('should handle multiple field updates', async () => {
      const updates = {
        bio: 'New bio',
        avatarUrl: 'https://example.com/new.jpg',
        email: 'new@example.com'
      };

      service.update(1, updates).subscribe();

      const req = httpMock.expectOne('/api/users/1');
      req.flush({ ...mockUser, ...updates });

      await new Promise(resolve => setTimeout(resolve, 0));
    });
  });

  describe('Error Handling', () => {
    it('should handle create errors', async () => {
      service.create({ username: 'duplicate' } as any).subscribe({
        error: (err) => {
          expect(err.status).toBe(409);
        }
      });

      const req = httpMock.expectOne('/api/users');
      req.flush({ message: 'User exists' }, { status: 409, statusText: 'Conflict' });

      await new Promise(resolve => setTimeout(resolve, 0));
    });

    it('should handle get by id errors', async () => {
      service.getById(999).subscribe({
        error: (err) => {
          expect(err.status).toBe(404);
        }
      });

      const req = httpMock.expectOne('/api/users/999');
      req.flush({ message: 'Not found' }, { status: 404, statusText: 'Not Found' });

      await new Promise(resolve => setTimeout(resolve, 0));
    });

    it('should handle update errors', async () => {
      service.update(1, { email: 'invalid' }).subscribe({
        error: (err) => {
          expect(err.status).toBe(400);
        }
      });

      const req = httpMock.expectOne('/api/users/1');
      req.flush({ message: 'Invalid' }, { status: 400, statusText: 'Bad Request' });

      await new Promise(resolve => setTimeout(resolve, 0));
    });

    it('should handle delete errors', async () => {
      service.delete(1).subscribe({
        error: (err) => {
          expect(err.status).toBe(403);
        }
      });

      const req = httpMock.expectOne('/api/users/1');
      req.flush({ message: 'Forbidden' }, { status: 403, statusText: 'Forbidden' });

      await new Promise(resolve => setTimeout(resolve, 0));
    });
  });

  describe('Data Integrity', () => {
    it('should preserve all fields during updates', async () => {
      service.update(1, { bio: 'Updated bio' }).subscribe();

      const req = httpMock.expectOne('/api/users/1');
      req.flush({ ...mockUser, bio: 'Updated bio' });

      await new Promise(resolve => setTimeout(resolve, 0));
    });

    it('should handle users without optional fields', async () => {
      const minimalUser: User = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hashed'
      };

      service.getById(1).subscribe();

      const req = httpMock.expectOne('/api/users/1');
      req.flush(minimalUser);

      await new Promise(resolve => setTimeout(resolve, 0));
    });
  });
});
