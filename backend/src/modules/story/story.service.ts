import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Story } from './story.entity';
import { StoryView } from './story-view.entity';

@Injectable()
export class StoryService {
  constructor(
    @InjectRepository(Story)
    private readonly storyRepo: Repository<Story>,
    @InjectRepository(StoryView)
    private readonly viewRepo: Repository<StoryView>,
  ) {}

  /** Tạo story mới — hết hạn sau 24h */
  async create(userId: number, data: { mediaUrl: string; mediaType: 'image' | 'video'; caption?: string }): Promise<Story> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const story = this.storyRepo.create({
      userId,
      mediaUrl: data.mediaUrl,
      mediaType: data.mediaType,
      caption: data.caption || '',
      expiresAt,
    });
    return this.storyRepo.save(story);
  }

  /** Lấy tất cả story còn hiệu lực, gom theo user */
  async getActiveStories(currentUserId: number): Promise<{
    users: Array<{
      userId: number;
      username: string;
      displayName: string;
      avatar: string;
      stories: Array<any>;
      hasUnviewed: boolean;
    }>;
  }> {
    const now = new Date();

    const stories = await this.storyRepo.find({
      where: { expiresAt: MoreThan(now) },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });

    // Lấy tất cả views của user hiện tại
    const viewedStoryIds = new Set<number>();
    if (stories.length > 0) {
      const views = await this.viewRepo.find({
        where: { viewerId: currentUserId },
      });
      views.forEach(v => viewedStoryIds.add(v.storyId));
    }

    // Gom theo user
    const userMap = new Map<number, {
      userId: number;
      username: string;
      displayName: string;
      avatar: string;
      stories: Array<Story & { isViewed: boolean }>;
      hasUnviewed: boolean;
    }>();

    for (const story of stories) {
      const uid = story.userId;
      if (!userMap.has(uid)) {
        userMap.set(uid, {
          userId: uid,
          username: story.user?.username || '',
          displayName: story.user?.displayName || story.user?.username || '',
          avatar: story.user?.avatar || '',
          stories: [],
          hasUnviewed: false,
        });
      }
      const isViewed = viewedStoryIds.has(story.id);
      const entry = userMap.get(uid)!;
      // Xóa passwordHash trước khi trả về
      if (story.user) {
        delete (story.user as any).passwordHash;
      }
      entry.stories.push({ ...story, isViewed });
      if (!isViewed) {
        entry.hasUnviewed = true;
      }
    }

    // Sắp xếp: current user lên đầu, sau đó user còn story chưa xem lên trước
    const users = Array.from(userMap.values()).sort((a, b) => {
      if (a.userId === currentUserId) return -1;
      if (b.userId === currentUserId) return 1;
      if (a.hasUnviewed && !b.hasUnviewed) return -1;
      if (!a.hasUnviewed && b.hasUnviewed) return 1;
      return 0;
    });

    return { users };
  }

  /** Lấy stories của 1 user cụ thể */
  async getUserStories(userId: number, currentUserId: number): Promise<any[]> {
    const now = new Date();
    const stories = await this.storyRepo.find({
      where: { userId, expiresAt: MoreThan(now) },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });

    const views = await this.viewRepo.find({
      where: { viewerId: currentUserId },
    });
    const viewedIds = new Set(views.map(v => v.storyId));

    return stories.map(s => {
      if (s.user) delete (s.user as any).passwordHash;
      return { ...s, isViewed: viewedIds.has(s.id) };
    });
  }

  /** Đánh dấu đã xem story */
  async markViewed(storyId: number, viewerId: number): Promise<void> {
    // Không tự xem story của mình
    const story = await this.storyRepo.findOne({ where: { id: storyId } });
    if (!story || story.userId === viewerId) return;

    const existing = await this.viewRepo.findOne({ where: { storyId, viewerId } });
    if (!existing) {
      await this.viewRepo.save(this.viewRepo.create({ storyId, viewerId }));
    }
  }

  /** Lấy danh sách người xem story */
  async getViewers(storyId: number): Promise<StoryView[]> {
    return this.viewRepo.find({
      where: { storyId },
      relations: ['viewer'],
      order: { viewedAt: 'DESC' },
    });
  }

  /** Xóa story của mình */
  async deleteStory(userId: number, storyId: number): Promise<boolean> {
    const story = await this.storyRepo.findOne({ where: { id: storyId } });
    if (!story || story.userId !== userId) return false;
    await this.storyRepo.delete(storyId);
    return true;
  }
}
