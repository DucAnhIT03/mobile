import api from '../services/api';

export interface StoryItem {
  id: number;
  userId: number;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption: string | null;
  createdAt: string;
  expiresAt: string;
  isViewed: boolean;
  user?: {
    id: number;
    username: string;
    displayName: string;
    avatar: string;
  };
}

export interface StoryUser {
  userId: number;
  username: string;
  displayName: string;
  avatar: string;
  stories: StoryItem[];
  hasUnviewed: boolean;
}

export interface StoriesResponse {
  users: StoryUser[];
}

export const storyApi = {
  /** Đăng story (upload 1 file) */
  createStory: (mediaUri: string, mediaType: 'image' | 'video', caption?: string) => {
    const formData = new FormData();
    const filename = mediaUri.split('/').pop() || 'story_media';
    const match = /\.(\w+)$/.exec(filename);
    const ext = match ? match[1].toLowerCase() : 'jpg';
    const isVideo = mediaType === 'video';
    const mimeType = isVideo ? `video/${ext === 'mov' ? 'quicktime' : ext}` : `image/${ext}`;

    formData.append('media', { uri: mediaUri, name: filename, type: mimeType } as any);
    if (caption) {
      formData.append('caption', caption);
    }

    return api.post<StoryItem>('/stories', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });
  },

  /** Lấy tất cả story còn hiệu lực, gom theo user */
  getStories: () =>
    api.get<StoriesResponse>('/stories'),

  /** Lấy stories của 1 user */
  getUserStories: (userId: number) =>
    api.get<StoryItem[]>(`/stories/user/${userId}`),

  /** Đánh dấu đã xem */
  markViewed: (storyId: number) =>
    api.post(`/stories/${storyId}/view`),

  /** Xóa story */
  deleteStory: (storyId: number) =>
    api.delete(`/stories/${storyId}`),
};
