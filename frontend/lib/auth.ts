import api from './api';

export interface User {
  id: string;
  email: string;
  name?: string;
  plan: 'FREE' | 'STARTER' | 'GROWTH' | 'ENTERPRISE';
  image?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export async function register(email: string, password: string, name?: string): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/register', {
    email,
    password,
    name,
  });
  
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  
  return response.data;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/login', {
    email,
    password,
  });
  
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  
  return response.data;
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
