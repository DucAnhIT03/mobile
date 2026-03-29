import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'text', nullable: true })
  caption: string;

  @Column({ default: 'image' })
  type: 'image' | 'video'; // loại bài viết

  @Column({ type: 'simple-json' })
  media: string[]; // Mảng đường dẫn file: ["/uploads/posts/xxx.jpg", "/uploads/posts/xxx.mp4"]

  @Column({ nullable: true })
  thumbnail: string; // Thumbnail cho video

  @Column({ name: 'likes_count', default: 0 })
  likesCount: number;

  @Column({ name: 'comments_count', default: 0 })
  commentsCount: number;

  @Column({ name: 'views_count', default: 0 })
  viewsCount: number;

  @Column({ name: 'shares_count', default: 0 })
  sharesCount: number;

  @Column({ name: 'total_watch_time_ms', type: 'bigint', default: 0 })
  totalWatchTimeMs: number;

  @Column({ name: 'avg_completion_rate', type: 'float', default: 0 })
  avgCompletionRate: number;

  @Column({ type: 'simple-json', nullable: true })
  tags: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
