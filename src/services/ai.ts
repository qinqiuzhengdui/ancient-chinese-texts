import api from './api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const chatAPI = async (messages: ChatMessage[]) => {
  const response = await api.post('/api/ai/chat', { messages });
  return response.data;
};
