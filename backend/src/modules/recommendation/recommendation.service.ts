import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';
import { Post } from '../post/post.entity';
import { VideoInteraction, InteractionAction } from '../post/video-interaction.entity';
import { UserInterest } from '../post/user-interest.entity';

// Danh sách categories mặc định
const ALL_CATEGORIES = [
  'funny', 'game', 'education', 'music', 'travel',
  'food', 'tech', 'sport', 'fashion', 'art',
  'drama', 'news', 'dance', 'beauty', 'pet',
  'nature', 'comedy', 'diy', 'motivation', 'other',
];

// Trọng số cho scoring
const WEIGHTS = {
  similarity: 0.4,
  engagement: 0.25,
  freshness: 0.2,
  diversity: 0.15,
};

// Trọng số cho mỗi loại action → cập nhật interest score
const ACTION_WEIGHTS: Record<InteractionAction, number> = {
  view: 0.1,
  like: 0.3,
  comment: 0.4,
  share: 0.5,
  skip: -0.2,
  replay: 0.6,
};

@Injectable()
export class RecommendationService {
  constructor(
    @InjectRepository(Post) private postRepo: Repository<Post>,
    @InjectRepository(VideoInteraction) private interactionRepo: Repository<VideoInteraction>,
    @InjectRepository(UserInterest) private interestRepo: Repository<UserInterest>,
  ) {}

  // =============================================
  // 1. THU THẬP DỮ LIỆU (User Signals)
  // =============================================

  /** Ghi nhận tương tác video */
  async trackInteraction(userId: number, data: {
    postId: number;
    action: InteractionAction;
    watchTimeMs?: number;
    videoDurationMs?: number;
  }) {
    const completionRate = data.videoDurationMs && data.videoDurationMs > 0
      ? Math.min(1, (data.watchTimeMs || 0) / data.videoDurationMs)
      : 0;

    // Lưu interaction
    const interaction = this.interactionRepo.create({
      userId,
      postId: data.postId,
      action: data.action,
      watchTimeMs: data.watchTimeMs || 0,
      videoDurationMs: data.videoDurationMs || 0,
      completionRate,
    });
    await this.interactionRepo.save(interaction);

    // Cập nhật post stats
    const post = await this.postRepo.findOne({ where: { id: data.postId } });
    if (post) {
      if (data.action === 'view') {
        post.viewsCount = (post.viewsCount || 0) + 1;
        post.totalWatchTimeMs = Number(post.totalWatchTimeMs || 0) + (data.watchTimeMs || 0);
        // Tính lại avg completion rate
        const avgRate = await this.interactionRepo
          .createQueryBuilder('vi')
          .select('AVG(vi.completionRate)', 'avg')
          .where('vi.postId = :postId AND vi.action = :action', { postId: data.postId, action: 'view' })
          .getRawOne();
        post.avgCompletionRate = parseFloat(avgRate?.avg) || 0;
      } else if (data.action === 'share') {
        post.sharesCount = (post.sharesCount || 0) + 1;
      }
      await this.postRepo.save(post);
    }

    // Cập nhật user interest
    if (post?.tags && post.tags.length > 0) {
      await this.updateUserInterests(userId, post.tags, data.action, completionRate);
    }

    return { success: true };
  }

  // =============================================
  // 2. XÂY DỰNG HỒ SƠ NGƯỜI DÙNG (User Embedding)
  // =============================================

  /** Cập nhật user interest scores dựa trên action */
  private async updateUserInterests(
    userId: number,
    tags: string[],
    action: InteractionAction,
    completionRate: number,
  ) {
    const actionWeight = ACTION_WEIGHTS[action] || 0;
    // Bonus cho completion rate cao
    const completionBonus = completionRate > 0.8 ? 0.15 : completionRate > 0.5 ? 0.05 : 0;
    const delta = actionWeight + completionBonus;

    for (const tag of tags) {
      let interest = await this.interestRepo.findOne({
        where: { userId, category: tag },
      });

      if (interest) {
        // Exponential moving average: score = 0.8 * old + 0.2 * new
        const newScore = Math.max(0, Math.min(1,
          interest.score * 0.8 + (interest.score + delta) * 0.2
        ));
        interest.score = newScore;
        interest.interactionCount += 1;
      } else {
        interest = this.interestRepo.create({
          userId,
          category: tag,
          score: Math.max(0, Math.min(1, 0.5 + delta)),
          interactionCount: 1,
        });
      }
      await this.interestRepo.save(interest);
    }
  }

  /** Lấy user embedding (vector sở thích) */
  async getUserEmbedding(userId: number): Promise<Record<string, number>> {
    const interests = await this.interestRepo.find({ where: { userId } });
    const embedding: Record<string, number> = {};
    for (const interest of interests) {
      embedding[interest.category] = interest.score;
    }
    return embedding;
  }

  // =============================================
  // 3. THUẬT TOÁN ĐỀ XUẤT (Core Ranking)
  // =============================================

  /** Score(u,v) = w1·Similarity + w2·Engagement + w3·Freshness + w4·Diversity */
  private calculateScore(
    userEmbedding: Record<string, number>,
    post: Post,
    recentCategories: string[],
  ): number {
    const similarity = this.calcSimilarity(userEmbedding, post.tags || []);
    const engagement = this.calcEngagement(post);
    const freshness = this.calcFreshness(post.createdAt);
    const diversity = this.calcDiversity(post.tags || [], recentCategories);

    return (
      WEIGHTS.similarity * similarity +
      WEIGHTS.engagement * engagement +
      WEIGHTS.freshness * freshness +
      WEIGHTS.diversity * diversity
    );
  }

  /** Cosine similarity giữa user embedding và video tags */
  private calcSimilarity(userEmbedding: Record<string, number>, tags: string[]): number {
    if (tags.length === 0) return 0.3; // Default cho video không có tag

    let dotProduct = 0;
    let userMag = 0;
    let videoMag = 0;

    for (const tag of tags) {
      const userScore = userEmbedding[tag] || 0;
      const videoScore = 1; // Video có tag này → score = 1
      dotProduct += userScore * videoScore;
      userMag += userScore * userScore;
      videoMag += videoScore * videoScore;
    }

    // Thêm tất cả user interests
    for (const score of Object.values(userEmbedding)) {
      userMag += score * score;
    }

    const magnitude = Math.sqrt(userMag) * Math.sqrt(videoMag);
    return magnitude > 0 ? dotProduct / magnitude : 0;
  }

  /** Engagement score (normalized 0-1) */
  private calcEngagement(post: Post): number {
    const likes = post.likesCount || 0;
    const comments = post.commentsCount || 0;
    const shares = post.sharesCount || 0;
    const views = post.viewsCount || 1;
    const completion = post.avgCompletionRate || 0;

    // Engagement rate
    const interactionRate = (likes + comments * 2 + shares * 3) / views;
    // Normalize bằng sigmoid
    const normalizedRate = 1 / (1 + Math.exp(-interactionRate * 5));
    // Kết hợp với completion rate
    return normalizedRate * 0.6 + completion * 0.4;
  }

  /** Freshness score — video mới ưu tiên hơn */
  private calcFreshness(createdAt: Date): number {
    const hoursSincePosted = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
    return 1 / (1 + hoursSincePosted / 24);
  }

  /** Diversity — tránh lặp nội dung */
  private calcDiversity(tags: string[], recentCategories: string[]): number {
    if (tags.length === 0 || recentCategories.length === 0) return 1;
    const overlap = tags.filter(t => recentCategories.includes(t)).length;
    return 1 - (overlap / Math.max(tags.length, 1));
  }

  // =============================================
  // 4. TẠO FEED ĐỀ XUẤT (FYP – For You Page)
  // =============================================

  /** Feed chiến lược: 70% phù hợp, 20% tương tự, 10% khám phá */
  async getRecommendedFeed(userId: number, page = 1, limit = 10) {
    const userEmbedding = await this.getUserEmbedding(userId);

    // Lấy video đã xem gần đây (tránh hiển thị lại)
    const recentViewed = await this.interactionRepo
      .createQueryBuilder('vi')
      .select('DISTINCT vi.postId', 'postId')
      .where('vi.userId = :userId', { userId })
      .orderBy('vi.createdAt', 'DESC')
      .limit(100)
      .getRawMany();
    const viewedIds = recentViewed.map(r => r.postId);

    // Lấy tất cả video type posts chưa xem
    const queryBuilder = this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .where('post.type = :type', { type: 'video' });

    if (viewedIds.length > 0) {
      queryBuilder.andWhere('post.id NOT IN (:...viewedIds)', { viewedIds });
    }

    const allVideos = await queryBuilder
      .orderBy('post.createdAt', 'DESC')
      .take(200) // Pool lớn hơn để ranking
      .getMany();

    // Lấy categories gần đây để tính diversity
    const recentInteractions = await this.interactionRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 10,
      relations: ['post'],
    });
    const recentCategories = recentInteractions
      .flatMap(i => i.post?.tags || [])
      .slice(0, 10);

    // Score từng video
    const scored = allVideos.map(post => {
      // Remove password from user
      if (post.user) {
        delete (post.user as any).passwordHash;
      }
      return {
        post,
        score: this.calculateScore(userEmbedding, post, recentCategories),
      };
    });

    // Sort theo score (cao → thấp)
    scored.sort((a, b) => b.score - a.score);

    // Áp dụng chiến lược 70/20/10
    const feedSize = limit;
    const relevantCount = Math.ceil(feedSize * 0.7);
    const similarCount = Math.ceil(feedSize * 0.2);
    const explorationCount = feedSize - relevantCount - similarCount;

    const feed: Post[] = [];

    // 70% — top scored (phù hợp nhất)
    feed.push(...scored.slice(0, relevantCount).map(s => s.post));

    // 20% — mid-range (tương tự)
    const midRange = scored.slice(relevantCount, relevantCount + similarCount * 3);
    const shuffledMid = midRange.sort(() => Math.random() - 0.5);
    feed.push(...shuffledMid.slice(0, similarCount).map(s => s.post));

    // 10% — random exploration (khám phá)
    const remaining = scored.slice(relevantCount + similarCount * 3);
    const shuffledExplore = remaining.sort(() => Math.random() - 0.5);
    feed.push(...shuffledExplore.slice(0, explorationCount).map(s => s.post));

    // Shuffle lại feed để tự nhiên hơn (giữ top 2 vị trí cho relevant)
    const topPosts = feed.slice(0, 2);
    const restPosts = feed.slice(2).sort(() => Math.random() - 0.5);
    const finalFeed = [...topPosts, ...restPosts];

    // Pagination
    const start = (page - 1) * limit;
    const paged = finalFeed.slice(start, start + limit);

    return {
      posts: paged,
      total: finalFeed.length,
      page,
    };
  }

  // =============================================
  // 5. EXTRACT TAGS TỪ CAPTION
  // =============================================

  /** Trích xuất hashtags từ caption và map sang categories */
  static extractTags(caption: string): string[] {
    if (!caption) return ['other'];

    const text = caption.toLowerCase();

    // Extract hashtags
    const hashtags = (text.match(/#(\w+)/g) || []).map(h => h.replace('#', ''));

    // Keyword mapping
    const keywordMap: Record<string, string[]> = {
      funny: ['funny', 'hài', 'haha', 'lol', 'meme', 'comedy', 'cười', 'fun'],
      game: ['game', 'gaming', 'gamer', 'esport', 'gameplay', 'trò chơi'],
      education: ['education', 'learn', 'study', 'học', 'giáo dục', 'kiến thức', 'tips'],
      music: ['music', 'song', 'nhạc', 'hát', 'sing', 'melody', 'beat', 'remix'],
      travel: ['travel', 'du lịch', 'trip', 'explore', 'adventure', 'beach', 'biển'],
      food: ['food', 'cooking', 'ẩm thực', 'nấu', 'recipe', 'đồ ăn', 'món', 'yummy'],
      tech: ['tech', 'technology', 'coding', 'code', 'ai', 'smartphone', 'review', 'công nghệ'],
      sport: ['sport', 'gym', 'fitness', 'workout', 'thể thao', 'football', 'bóng đá'],
      fashion: ['fashion', 'style', 'outfit', 'thời trang', 'ootd', 'dress'],
      art: ['art', 'draw', 'paint', 'design', 'nghệ thuật', 'vẽ', 'creative'],
      drama: ['drama', 'phim', 'movie', 'series', 'kdrama', 'anime'],
      dance: ['dance', 'nhảy', 'tiktok', 'choreography', 'dancechallenge'],
      beauty: ['beauty', 'makeup', 'skincare', 'đẹp', 'trang điểm', 'mỹ phẩm'],
      pet: ['pet', 'cat', 'dog', 'mèo', 'chó', 'animal', 'cute'],
      nature: ['nature', 'thiên nhiên', 'sunset', 'landscape', 'flower'],
      motivation: ['motivation', 'inspire', 'success', 'motivational', 'quotes'],
      diy: ['diy', 'handmade', 'craft', 'tutorial', 'howto'],
      news: ['news', 'trending', 'viral', 'tin tức', 'breaking'],
    };

    const tags = new Set<string>();

    // Match hashtags
    for (const h of hashtags) {
      for (const [category, keywords] of Object.entries(keywordMap)) {
        if (keywords.includes(h)) {
          tags.add(category);
        }
      }
    }

    // Match caption text
    for (const [category, keywords] of Object.entries(keywordMap)) {
      if (keywords.some(kw => text.includes(kw))) {
        tags.add(category);
      }
    }

    return tags.size > 0 ? Array.from(tags) : ['other'];
  }
}
