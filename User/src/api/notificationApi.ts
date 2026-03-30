import api from '../services/api';

export interface NotificationItem {
  id: number;
  type: 'follow' | 'like' | 'comment' | 'mention' | 'system';
  content: string | null;
  postId: number | null;
  isRead: boolean;
  createdAt: string;
  actor: {
    id: number;
    username: string;
    displayName: string;
    avatar: string;
  } | null;
}

export interface NotificationsResponse {
  items: NotificationItem[];
  total: number;
  unreadCount: number;
}

export const notificationApi = {
  /** Lấy danh sách thông báo */
  getNotifications: (page = 1) =>
    api.get<NotificationsResponse>('/notifications', { params: { page } }),

  /** Đếm thông báo chưa đọc */
  getUnreadCount: () =>
    api.get<{ count: number }>('/notifications/unread-count'),

  /** Đánh dấu tất cả đã đọc */
  markAllAsRead: () =>
    api.post('/notifications/mark-all-read'),

  /** Đánh dấu 1 thông báo đã đọc */
  markAsRead: (notifId: number) =>
    api.post(`/notifications/${notifId}/read`),
};
