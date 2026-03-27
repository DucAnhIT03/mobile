import api from '../services/api';

export interface PostItem {
  id: number;
  userId: number;
  caption: string;
  type: 'image' | 'video';
  media: string[];
  thumbnail: string | null;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  user?: {
    id: number;
    username: string;
    displayName: string;
    avatar: string;
  };
}

export interface CommentItem {
  id: number;
  userId: number;
  postId: number;
  content: string;
  createdAt: string;
  user?: {
    id: number;
    username: string;
    displayName: string;
    avatar: string;
  };
}

export interface PostsResponse {
  posts: PostItem[];
  total: number;
}

export interface CommentsResponse {
  comments: CommentItem[];
  total: number;
}

export const postApi = {
  /** Tạo bài viết (ảnh hoặc video) */
  createPost: (data: { caption: string; type: 'image' | 'video'; mediaUris: string[]; thumbnailUri?: string }) => {
    const formData = new FormData();
    formData.append('caption', data.caption);
    formData.append('type', data.type);

    data.mediaUris.forEach((uri, index) => {
      const filename = uri.split('/').pop() || `media_${index}`;
      const match = /\.(\w+)$/.exec(filename);
      const ext = match ? match[1].toLowerCase() : 'jpg';
      const isVideo = ['mp4', 'mov', 'avi', 'webm'].includes(ext);
      const type = isVideo ? `video/${ext === 'mov' ? 'quicktime' : ext}` : `image/${ext}`;
      formData.append('media', { uri, name: filename, type } as any);
    });

    if (data.thumbnailUri) {
      const filename = data.thumbnailUri.split('/').pop() || 'thumb.jpg';
      formData.append('media', { uri: data.thumbnailUri, name: filename, type: 'image/jpeg' } as any);
    }

    return api.post<PostItem>('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });
  },

  /** Feed chung */
  getFeed: (page = 1) =>
    api.get<PostsResponse>('/posts', { params: { page } }),

  /** Posts của 1 user */
  getUserPosts: (userId: number, page = 1) =>
    api.get<PostsResponse>(`/posts/user/${userId}`, { params: { page } }),

  /** Xóa bài viết */
  deletePost: (postId: number) =>
    api.delete<{ message: string }>(`/posts/${postId}`),

  /** Lấy video reels */
  getReels: (page = 1) =>
    api.get<PostsResponse>('/posts/reels', { params: { page } }),

  /** Tạo bài viết từ URL (không upload file) */
  createPostFromUrl: (data: { caption: string; type: 'image' | 'video'; mediaUrls: string[]; thumbnail?: string }) =>
    api.post<PostItem>('/posts/from-url', data),

  // =================== LIKE ===================

  /** Toggle like (like/unlike) */
  toggleLike: (postId: number) =>
    api.post<{ liked: boolean; likesCount: number }>(`/posts/${postId}/like`),

  /** Kiểm tra đã like chưa */
  isLiked: (postId: number) =>
    api.get<{ liked: boolean }>(`/posts/${postId}/liked`),

  // =================== COMMENT ===================

  /** Lấy danh sách bình luận */
  getComments: (postId: number, page = 1) =>
    api.get<CommentsResponse>(`/posts/${postId}/comments`, { params: { page } }),

  /** Thêm bình luận */
  addComment: (postId: number, content: string) =>
    api.post<CommentItem>(`/posts/${postId}/comments`, { content }),

  /** Xóa bình luận */
  deleteComment: (commentId: number) =>
    api.delete<{ message: string }>(`/posts/comments/${commentId}`),
};
