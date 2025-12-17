export interface User {
  id: number;
  username: string;
  email: string;
  bio?: string;
  passwordHash?: string,
  avatarUrl?: string;
}