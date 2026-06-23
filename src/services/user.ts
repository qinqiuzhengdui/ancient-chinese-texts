import api from './api';

export interface UserProfile {
  username?: string;
  email?: string;
  real_name?: string;
  phone?: string;
  birth_date?: string;
  gender?: string;
  education?: string;
  title?: string;
  address?: string;
  postal_code?: string;
}

export const getUserProfile = async () => {
  const response = await api.get('/api/users/me');
  return response.data;
};

export const updateUserProfile = async (data: any) => {
  const response = await api.put('/api/users/me', data);
  return response.data;
};

export const sendVerifyCode = async (target: string) => {
  const response = await api.post('/api/users/verify-code', { target });
  return response.data;
};
