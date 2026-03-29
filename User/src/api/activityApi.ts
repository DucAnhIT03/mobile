import api from '../services/api';
import { PostItem } from './postApi';

export interface LikeHistoryItem {
  likeId: number;
  likedAt: string;
  post: PostItem;
}

export interface CommentHistoryItem {
  commentId: number;
  content: string;
  commentedAt: string;
  post: PostItem;
}

export const activityApi = {
  /** Lấy lịch sử lượt thích */
  getMyLikes: (page = 1) =>
    api.get<{ items: LikeHistoryItem[]; total: number }>('/posts/activity/my-likes', { params: { page } }),

  /** Bỏ thích theo likeId */
  unlikeByLikeId: (likeId: number) =>
    api.delete<{ message: string }>(`/posts/activity/my-likes/${likeId}`),

  /** Lấy lịch sử bình luận */
  getMyComments: (page = 1) =>
    api.get<{ items: CommentHistoryItem[]; total: number }>('/posts/activity/my-comments', { params: { page } }),

  /** Xóa bình luận */
  deleteComment: (commentId: number) =>
    api.delete<{ message: string }>(`/posts/comments/${commentId}`),
};
