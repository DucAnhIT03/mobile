import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User } from './user.entity';
import { UserFollow } from './user-follow.entity';
import { Post } from '../post/post.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(UserFollow)
    private readonly followRepo: Repository<UserFollow>,
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
  ) {}

  async findById(id: number): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { username } });
  }

  async create(data: Partial<User>): Promise<User> {
    const user = this.userRepo.create(data);
    return this.userRepo.save(user);
  }

  async setOnline(userId: number, isOnline: boolean): Promise<void> {
    await this.userRepo.update(userId, {
      isOnline,
      lastSeen: isOnline ? undefined : new Date(),
    });
  }

  async search(query: string, currentUserId: number): Promise<User[]> {
    return this.userRepo.find({
      where: [
        { username: Like(`%${query}%`) },
        { email: Like(`%${query}%`) },
      ],
      select: ['id', 'username', 'displayName', 'email', 'avatar', 'isOnline'],
      take: 20,
    });
  }

  async findAll(): Promise<User[]> {
    return this.userRepo.find({
      select: ['id', 'username', 'displayName', 'email', 'avatar', 'isOnline'],
    });
  }

  // === Profile ===

  /** Bỏ dấu tiếng Việt */
  private removeVietnameseTones(str: string): string {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'D');
  }

  /** Tạo username dạng ID từ tên */
  private async generateUsername(name: string): Promise<string> {
    const base = this.removeVietnameseTones(name)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 20);

    for (let i = 0; i < 10; i++) {
      const randomNum = Math.floor(10000 + Math.random() * 90000);
      const candidate = `${base}_${randomNum}`;
      const existing = await this.userRepo.findOne({ where: { username: candidate } });
      if (!existing) return candidate;
    }
    return `${base}_${Date.now()}`;
  }

  /** Kiểm tra username có phải kiểu ID hay không (chỉ chứa a-z, 0-9, _) */
  private isValidIdUsername(username: string): boolean {
    return /^[a-z0-9_]+$/.test(username);
  }

  async getProfile(userId: number, currentUserId?: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) return null;

    // Auto-migrate: nếu username không phải dạng ID (chứa unicode/spaces) → tự tạo ID
    if (!this.isValidIdUsername(user.username)) {
      const oldName = user.username;
      const newUsername = await this.generateUsername(oldName);
      user.displayName = user.displayName || oldName;
      user.username = newUsername;
      await this.userRepo.update(userId, {
        username: newUsername,
        displayName: user.displayName,
      });
    }

    const followersCount = await this.followRepo.count({ where: { followingId: userId } });
    const followingCount = await this.followRepo.count({ where: { followerId: userId } });
    const postsCount = await this.postRepo.count({ where: { userId } });

    let isFollowing = false;
    if (currentUserId && currentUserId !== userId) {
      const follow = await this.followRepo.findOne({
        where: { followerId: currentUserId, followingId: userId },
      });
      isFollowing = !!follow;
    }

    const { passwordHash, ...safe } = user;
    return {
      ...safe,
      followersCount,
      followingCount,
      postsCount,
      isFollowing,
    };
  }

  async updateProfile(userId: number, data: { displayName?: string; bio?: string; avatar?: string; username?: string }) {
    if (data.username) {
      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (!user) throw new Error('Người dùng không tồn tại');

      // Chỉ validate nếu username thật sự thay đổi
      if (data.username !== user.username) {
        // Kiểm tra cooldown 7 ngày
        if (user.usernameChangedAt) {
          const daysSinceChange = (Date.now() - new Date(user.usernameChangedAt).getTime()) / (1000 * 60 * 60 * 24);
          if (daysSinceChange < 7) {
            const nextChangeDate = new Date(new Date(user.usernameChangedAt).getTime() + 7 * 24 * 60 * 60 * 1000);
            const formatted = nextChangeDate.toLocaleDateString('vi-VN');
            throw new Error(`Bạn chỉ được đổi ID 7 ngày 1 lần. Có thể đổi lại vào ${formatted}`);
          }
        }

        // Kiểm tra trùng
        const existing = await this.userRepo.findOne({ where: { username: data.username } });
        if (existing && existing.id !== userId) {
          throw new Error('ID người dùng này đã được sử dụng');
        }

        // Cập nhật thời gian đổi username
        (data as any).usernameChangedAt = new Date();
      }
    }
    await this.userRepo.update(userId, data);
    return this.getProfile(userId);
  }

  // === Follow ===

  async follow(followerId: number, followingId: number) {
    if (followerId === followingId) {
      throw new Error('Không thể tự theo dõi chính mình');
    }

    const exists = await this.followRepo.findOne({
      where: { followerId, followingId },
    });
    if (exists) {
      return { message: 'Đã theo dõi rồi' };
    }

    const follow = this.followRepo.create({ followerId, followingId });
    await this.followRepo.save(follow);
    return { message: 'Theo dõi thành công' };
  }

  async unfollow(followerId: number, followingId: number) {
    await this.followRepo.delete({ followerId, followingId });
    return { message: 'Hủy theo dõi thành công' };
  }

  async isFollowing(followerId: number, followingId: number): Promise<boolean> {
    const follow = await this.followRepo.findOne({
      where: { followerId, followingId },
    });
    return !!follow;
  }

  /** Lấy danh sách followers của userId */
  async getFollowers(userId: number, currentUserId: number) {
    const follows = await this.followRepo.find({
      where: { followingId: userId },
      relations: ['follower'],
      order: { createdAt: 'DESC' },
    });

    const users: any[] = [];
    for (const f of follows) {
      const { passwordHash, ...safe } = f.follower;
      const isFollowing = currentUserId === f.followerId
        ? false
        : await this.isFollowing(currentUserId, f.followerId);
      users.push({ ...safe, isFollowing });
    }
    return users;
  }

  /** Lấy danh sách following của userId */
  async getFollowing(userId: number, currentUserId: number) {
    const follows = await this.followRepo.find({
      where: { followerId: userId },
      relations: ['following'],
      order: { createdAt: 'DESC' },
    });

    const users: any[] = [];
    for (const f of follows) {
      const { passwordHash, ...safe } = f.following;
      const isFollowing = currentUserId === f.followingId
        ? true // nếu currentUser chính là người đang xem following list của mình
        : await this.isFollowing(currentUserId, f.followingId);
      users.push({ ...safe, isFollowing });
    }
    return users;
  }
}
