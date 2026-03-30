import api from '../services/api';

export interface AiChatMessage {
  role: 'user' | 'model';
  text: string;
}

export const aiApi = {
  /** Gửi tin nhắn cho AI */
  chat: (messages: AiChatMessage[]) =>
    api.post<{ reply: string }>('/ai/chat', { messages }),
};
