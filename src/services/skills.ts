import api from './api';

export interface SkillResponse {
  id: number;
  user_id: number;
  name: string;
  source_url: string | null;
  local_path: string;
  created_at: string;
}

export const getMySkills = async (): Promise<SkillResponse[]> => {
  const response = await api.get('/api/skills/my');
  return response.data;
};

export const importSkillByUrl = async (url: string): Promise<SkillResponse> => {
  const response = await api.post('/api/skills/import', { url });
  return response.data;
};

export const uploadSkillZip = async (file: File): Promise<SkillResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/api/skills/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};
