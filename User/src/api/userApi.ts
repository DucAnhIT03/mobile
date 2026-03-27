import api from '../services/api';

export interface UserInfo {
  id: number;
  username: string;
  displayName?: string;
  email: string;
  avatar: string;
  isOnline: boolean;
}

export interface UserProfile {
  id: number;
  username: string;
  displayName: string;
  email: string;
  avatar: string;
  bio: string;
  isOnline: boolean;
  lastSeen: string;
  createdAt: string;
  usernameChangedAt: string | null;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing: boolean;
}

export interface FollowUser {
  id: number;
  username: string;
  displayName: string;
  email: string;
  avatar: string;
  isOnline: boolean;
  isFollowing: boolean;
}

export const userApi = {
  /** Lấy thông tin user hiện tại (profile đầy đủ) */
  getMe: () => api.get<UserProfile>('/users/me'),

  /** Lấy profile của user khác */
  getProfile: (userId: number) =>
    api.get<UserProfile>(`/users/${userId}/profile`),

  /** Cập nhật profile */
  updateProfile: (data: { displayName?: string; bio?: string; avatar?: string; username?: string }) =>
    api.put<UserProfile>('/users/me/profile', data),

  /** Tìm kiếm user */
  search: (query: string) =>
    api.get<UserInfo[]>('/users/search', { params: { q: query } }),

  /** Lấy tất cả users */
  getAll: () => api.get<UserInfo[]>('/users'),

  /** Theo dõi user */
  follow: (userId: number) =>
    api.post<{ message: string }>(`/users/${userId}/follow`),

  /** Hủy theo dõi user */
  unfollow: (userId: number) =>
    api.delete<{ message: string }>(`/users/${userId}/follow`),

  /** Lấy danh sách followers */
  getFollowers: (userId: number) =>
    api.get<FollowUser[]>(`/users/${userId}/followers`),

  /** Lấy danh sách following */
  getFollowing: (userId: number) =>
    api.get<FollowUser[]>(`/users/${userId}/following`),

  /** Upload avatar */
  uploadAvatar: (uri: string) => {
    const formData = new FormData();
    const filename = uri.split('/').pop() || 'avatar.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    formData.append('avatar', { uri, name: filename, type } as any);
    return api.post<UserProfile>('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

