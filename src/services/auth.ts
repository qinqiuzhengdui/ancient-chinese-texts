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

export const registerAPI = async (username: string, email: string, email_code: string, phone: string, phone_code: string, password: string) => {
  const response = await api.post('/api/auth/register', {
    username,
    email,
    email_code,
    phone,
    phone_code,
    password
  });
  return response.data;
};
