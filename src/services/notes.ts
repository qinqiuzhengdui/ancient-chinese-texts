import api from './api';

export interface NoteResponse {
  id: number;
  user_id: number;
  content: string;
  created_at: string;
  updated_at: string;
}

export const createNote = async (content: string): Promise<NoteResponse> => {
  const response = await api.post('/api/notes/', { content });
  return response.data;
};

export const getMyNotes = async (): Promise<NoteResponse[]> => {
  const response = await api.get('/api/notes/my');
  return response.data;
};
