import api from './client';

export interface CustomerProfile {
  id: number;
  username: string;
  email: string;
  user_type: 'customer';
  created_at: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  account_balance: number;
}

export async function fetchProfile(): Promise<CustomerProfile> {
  const { data } = await api.get<CustomerProfile>('/customers/customer');
  return data;
}

export async function updateProfile(payload: {
  email?: string;
  password?: string;
  phone?: string;
}) {
  return api.put('/customers/customer_update', payload);
}
