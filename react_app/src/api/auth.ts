import api from './client';

export interface SignupPayload {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  password: string;
  user_type: 'customer' | 'staff';
  salary?: number;
  job_title?: string;
  hire_date?: string;
}

export async function login(
  email: string,
  password: string,
  user_type: 'customer' | 'staff'
): Promise<string> {
  const { data } = await api.post('/auth/login', { email, password, user_type });
  localStorage.setItem('token', data.jwToken);
  return data.jwToken;
}

export async function signup(payload: SignupPayload) {
  return api.post('/auth/signup', payload);
}

export async function verifySignup(email: string, code: string) {
  const { data } = await api.post('/auth/verify-signup', { email, code });
  localStorage.setItem('token', data.jwToken);
  return data.jwToken;
}

export async function forgotPassword(email: string, newPassword: string) {
  return api.post('/auth/forgot-password', { email, password: newPassword });
}

export async function verifyForgotPassword(email: string, code: string) {
  return api.put('/auth/verify-forgot-password', { email, code });
}
