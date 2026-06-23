import api from './api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const chatAPI = async (messages: ChatMessage[]) => {
  const response = await api.post('/api/ai/chat', { messages });
  return response.data;
};

// Stream-based API call using native fetch to handle Server-Sent Events (SSE)
export const streamChatAPI = async (
  messages: ChatMessage[],
  onChunk: (content: string) => void,
  onError: (error: string) => void,
  onDone: () => void
) => {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ messages })
    });

    if (!response.ok) {
      const errText = await response.text();
      onError(`Server error: ${response.status} ${errText}`);
      return;
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder('utf-8');

    if (!reader) {
      onError('Browser does not support stream reading');
      return;
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.replace('data: ', '').trim();
          if (dataStr === '[DONE]') {
            onDone();
            return;
          }
          if (dataStr) {
            try {
              const data = JSON.parse(dataStr);
              if (data.error) {
                onError(data.error);
                return;
              }
              if (data.content) {
                onChunk(data.content);
              }
            } catch (e) {
              console.error('Error parsing SSE data:', dataStr, e);
            }
          }
        }
      }
    }
    
    onDone();
  } catch (err: any) {
    onError(err.message || 'Network error');
  }
};
