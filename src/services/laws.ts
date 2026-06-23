import api from './api';

export interface LawNode {
  level: string;
  prefix: string;
  content: string;
  children?: LawNode[];
}

export interface LawListResponse {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface LawResponse {
  id: string;
  title: string;
  nodes: LawNode[];
  raw_text: string;
  created_at: string;
  updated_at: string;
}

export const getLaws = async (): Promise<LawListResponse[]> => {
  const response = await api.get('/api/laws/');
  return response.data;
};

export const getLawById = async (id: string): Promise<LawResponse> => {
  const response = await api.get(`/api/laws/${id}`);
  return response.data;
};

export const importLaw = async (file: File): Promise<LawResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/api/laws/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const updateLaw = async (id: string, title?: string, raw_text?: string): Promise<LawResponse> => {
  const response = await api.put(`/api/laws/${id}`, { title, raw_text });
  return response.data;
};

export const deleteLaw = async (id: string): Promise<void> => {
  await api.delete(`/api/laws/${id}`);
};
