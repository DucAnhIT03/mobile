import api from '../services/api';

export interface ConversationItem {
  id: number;
  type: 'private' | 'group';
  name: string;
  avatar: string;
  isOnline: boolean;
  participants: {
    id: number;
    username: string;
    avatar: string;
    isOnline: boolean;
  }[];
  lastMessage: {
    id: number;
    content: string;
    type: string;
    senderId: number;
    createdAt: string;
  } | null;
  unreadCount: number;
  updatedAt: string;
}

export interface MessageItem {
  id: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  senderAvatar: string;
  content: string;
  type: 'text' | 'image' | 'video';
  isRead: boolean;
  createdAt: string;
  isMine: boolean;
}

export const chatApi = {
  /** Lấy danh sách cuộc hội thoại */
  getConversations: () =>
    api.get<ConversationItem[]>('/chat/conversations'),

  /** Lấy lịch sử tin nhắn */
  getMessages: (conversationId: number, page = 1) =>
    api.get<MessageItem[]>(`/chat/conversations/${conversationId}/messages`, {
      params: { page },
    }),

  /** Tạo cuộc hội thoại mới (private 1-1) */
  createConversation: (targetUserId: number) =>
    api.post<{ id: number; type: string }>('/chat/conversations', { targetUserId }),

  /** Đánh dấu đã đọc */
  markAsRead: (conversationId: number) =>
    api.post(`/chat/conversations/${conversationId}/read`),
};
