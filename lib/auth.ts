import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  avatar_url?: string;
  password?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

// Simulate database storage
let users: User[] = [
  {
    id: '1',
    username: 'demo',
    email: 'demo@example.com',
    name: 'Demo User',
    avatar_url: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
  }
];

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

export function findUserByEmail(email: string): User | undefined {
  return users.find(user => user.email === email);
}

export function findUserById(id: string): User | undefined {
  return users.find(user => user.id === id);
}

export function createUser(userData: Omit<User, 'id'>): User {
  const newUser: User = {
    ...userData,
    id: Date.now().toString(),
  };
  users.push(newUser);
  return newUser;
}

export function updateUser(id: string, updates: Partial<User>): User | null {
  const userIndex = users.findIndex(user => user.id === id);
  if (userIndex === -1) return null;
  
  users[userIndex] = { ...users[userIndex], ...updates };
  return users[userIndex];
}