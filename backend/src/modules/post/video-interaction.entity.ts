import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../user/user.entity';
import { Post } from './post.entity';

export type InteractionAction = 'view' | 'like' | 'comment' | 'share' | 'skip' | 'replay';

@Entity('video_interactions')
@Index(['userId', 'postId'])
@Index(['postId', 'action'])
export class VideoInteraction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'post_id' })
  postId: number;

  @Column({ name: 'watch_time_ms', default: 0 })
  watchTimeMs: number;

  @Column({ name: 'video_duration_ms', default: 0 })
  videoDurationMs: number;

  @Column({ name: 'completion_rate', type: 'float', default: 0 })
  completionRate: number; // 0.0 - 1.0

  @Column({ type: 'varchar', length: 20, default: 'view' })
  action: InteractionAction;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Post, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
