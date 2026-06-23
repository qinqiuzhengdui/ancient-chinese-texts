import api from './api';

export const loginAPI = async (username: string, password: string) => {
  // FastAPI OAuth2PasswordRequestForm requires application/x-www-form-urlencoded
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);
  
  const response = await api.post('/api/auth/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  return response.data;
};

export const registerAPI = async (username: string, email: string, password: string) => {
  const response = await api.post('/api/auth/register', {
    username,
    email,
    password
  });
  return response.data;
};
