import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { Like } from './like.entity';
import { Comment } from './comment.entity';
import { Bookmark } from './bookmark.entity';
import { RecommendationService } from '../recommendation/recommendation.service';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
    @InjectRepository(Like)
    private readonly likeRepo: Repository<Like>,
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
    @InjectRepository(Bookmark)
    private readonly bookmarkRepo: Repository<Bookmark>,
  ) {}


  async create(userId: number, data: { caption: string; type: 'image' | 'video'; media: string[]; thumbnail?: string }): Promise<Post> {
    const tags = RecommendationService.extractTags(data.caption);
    const post = this.postRepo.create({ userId, ...data, tags });
    return this.postRepo.save(post);
  }

  async getFeed(page = 1, limit = 20): Promise<{ posts: Post[]; total: number }> {
    const [posts, total] = await this.postRepo.findAndCount({
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    posts.forEach(p => {
      if (p.user) {
        delete (p.user as any).passwordHash;
      }
    });
    return { posts, total };
  }

  /** Lấy danh sách video reels */
  async getReels(page = 1, limit = 20): Promise<{ posts: Post[]; total: number }> {
    const [posts, total] = await this.postRepo.findAndCount({
      where: { type: 'video' },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    posts.forEach(p => {
      if (p.user) {
        delete (p.user as any).passwordHash;
      }
    });
    return { posts, total };
  }

  /** Tạo bài viết từ URL (không upload file) */
  async createFromUrl(userId: number, data: { caption: string; type: 'image' | 'video'; mediaUrls: string[]; thumbnail?: string }): Promise<Post> {
    const tags = RecommendationService.extractTags(data.caption);
    const post = this.postRepo.create({
      userId,
      caption: data.caption,
      type: data.type,
      media: data.mediaUrls,
      thumbnail: data.thumbnail,
      tags,
    });
    return this.postRepo.save(post);
  }

  async getUserPosts(userId: number, page = 1, limit = 30): Promise<{ posts: Post[]; total: number }> {
    const [posts, total] = await this.postRepo.findAndCount({
      where: { userId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    posts.forEach(p => {
      if (p.user) {
        delete (p.user as any).passwordHash;
      }
    });
    return { posts, total };
  }

  async getPostById(id: number): Promise<Post | null> {
    return this.postRepo.findOne({ where: { id }, relations: ['user'] });
  }

  async deletePost(userId: number, postId: number): Promise<boolean> {
    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post || post.userId !== userId) return false;
    await this.postRepo.delete(postId);
    return true;
  }

  async countByUser(userId: number): Promise<number> {
    return this.postRepo.count({ where: { userId } });
  }

  // =================== LIKE ===================

  async toggleLike(userId: number, postId: number): Promise<{ liked: boolean; likesCount: number }> {
    const existing = await this.likeRepo.findOne({ where: { userId, postId } });

    if (existing) {
      // Unlike
      await this.likeRepo.delete(existing.id);
      await this.postRepo.decrement({ id: postId }, 'likesCount', 1);
    } else {
      // Like
      await this.likeRepo.save(this.likeRepo.create({ userId, postId }));
      await this.postRepo.increment({ id: postId }, 'likesCount', 1);
    }

    const post = await this.postRepo.findOne({ where: { id: postId } });
    return { liked: !existing, likesCount: post?.likesCount ?? 0 };
  }

  async isLikedByUser(userId: number, postId: number): Promise<boolean> {
    const count = await this.likeRepo.count({ where: { userId, postId } });
    return count > 0;
  }

  // =================== COMMENT ===================

  async addComment(userId: number, postId: number, content: string): Promise<Comment> {
    const comment = this.commentRepo.create({ userId, postId, content });
    const saved = await this.commentRepo.save(comment);
    await this.postRepo.increment({ id: postId }, 'commentsCount', 1);
    // Return with user relation
    return this.commentRepo.findOne({ where: { id: saved.id }, relations: ['user'] }) as Promise<Comment>;
  }

  async getComments(postId: number, page = 1, limit = 50): Promise<{ comments: Comment[]; total: number }> {
    const [comments, total] = await this.commentRepo.findAndCount({
      where: { postId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    comments.forEach(c => {
      if (c.user) {
        delete (c.user as any).passwordHash;
      }
    });
    return { comments, total };
  }

  async deleteComment(userId: number, commentId: number): Promise<boolean> {
    const comment = await this.commentRepo.findOne({ where: { id: commentId } });
    if (!comment || comment.userId !== userId) return false;
    await this.commentRepo.delete(commentId);
    await this.postRepo.decrement({ id: comment.postId }, 'commentsCount', 1);
    return true;
  }

  // =================== ACTIVITY HISTORY ===================

  /** Lấy danh sách bài viết user đã like */
  async getUserLikes(userId: number, page = 1, limit = 30): Promise<{ items: any[]; total: number }> {
    const [likes, total] = await this.likeRepo.findAndCount({
      where: { userId },
      relations: ['post', 'post.user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const items = likes.map(like => {
      if (like.post?.user) delete (like.post.user as any).passwordHash;
      return {
        likeId: like.id,
        likedAt: like.createdAt,
        post: like.post,
      };
    });

    return { items, total };
  }

  /** Bỏ like (unlike) theo likeId */
  async unlikeByLikeId(userId: number, likeId: number): Promise<boolean> {
    const like = await this.likeRepo.findOne({ where: { id: likeId } });
    if (!like || like.userId !== userId) return false;
    await this.likeRepo.delete(likeId);
    await this.postRepo.decrement({ id: like.postId }, 'likesCount', 1);
    return true;
  }

  /** Lấy danh sách comment của user */
  async getUserComments(userId: number, page = 1, limit = 30): Promise<{ items: any[]; total: number }> {
    const [comments, total] = await this.commentRepo.findAndCount({
      where: { userId },
      relations: ['post', 'post.user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const items = comments.map(c => {
      if (c.post?.user) delete (c.post.user as any).passwordHash;
      return {
        commentId: c.id,
        content: c.content,
        commentedAt: c.createdAt,
        post: c.post,
      };
    });

    return { items, total };
  }

  // =================== BOOKMARKS ===================

  async toggleBookmark(userId: number, postId: number): Promise<{ saved: boolean }> {
    const existing = await this.bookmarkRepo.findOne({ where: { userId, postId } });
    if (existing) {
      await this.bookmarkRepo.delete(existing.id);
      return { saved: false };
    }
    await this.bookmarkRepo.save(this.bookmarkRepo.create({ userId, postId }));
    return { saved: true };
  }

  async isBookmarked(userId: number, postId: number): Promise<boolean> {
    const count = await this.bookmarkRepo.count({ where: { userId, postId } });
    return count > 0;
  }

  async getUserBookmarks(userId: number, page = 1, limit = 30): Promise<{ items: any[]; total: number }> {
    const [bookmarks, total] = await this.bookmarkRepo.findAndCount({
      where: { userId },
      relations: ['post', 'post.user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    const items = bookmarks.map(b => {
      if (b.post?.user) delete (b.post.user as any).passwordHash;
      return { bookmarkId: b.id, savedAt: b.createdAt, post: b.post };
    });
    return { items, total };
  }
}
