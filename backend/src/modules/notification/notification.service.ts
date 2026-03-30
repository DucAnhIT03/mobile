import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notifRepo: Repository<Notification>,
  ) {}

  /** Tạo thông báo mới */
  async create(data: {
    userId: number;
    actorId: number;
    type: 'follow' | 'like' | 'comment' | 'mention' | 'system';
    content?: string;
    postId?: number;
  }): Promise<Notification | undefined> {
    // Không tạo thông báo cho chính mình
    if (data.userId === data.actorId) return undefined;
    const notif = this.notifRepo.create(data);
    return this.notifRepo.save(notif);
  }

  /** Lấy danh sách thông báo của user */
  async getMyNotifications(userId: number, page = 1, limit = 30) {
    const [items, total] = await this.notifRepo.findAndCount({
      where: { userId },
      relations: ['actor'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items: items.map(n => ({
        id: n.id,
        type: n.type,
        content: n.content,
        postId: n.postId,
        isRead: n.isRead,
        createdAt: n.createdAt,
        actor: n.actor ? {
          id: n.actor.id,
          username: n.actor.username,
          displayName: n.actor.displayName,
          avatar: n.actor.avatar,
        } : null,
      })),
      total,
      unreadCount: await this.notifRepo.count({ where: { userId, isRead: false } }),
    };
  }

  /** Đếm số thông báo chưa đọc */
  async countUnread(userId: number): Promise<number> {
    return this.notifRepo.count({ where: { userId, isRead: false } });
  }

  /** Đánh dấu tất cả đã đọc */
  async markAllAsRead(userId: number): Promise<void> {
    await this.notifRepo.update({ userId, isRead: false }, { isRead: true });
  }

  /** Đánh dấu 1 thông báo đã đọc */
  async markAsRead(userId: number, notifId: number): Promise<void> {
    await this.notifRepo.update({ id: notifId, userId }, { isRead: true });
  }
}
