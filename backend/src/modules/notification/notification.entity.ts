import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  /** ID người nhận thông báo */
  @Column()
  userId: number;

  /** ID người gây ra hành động (follow, like, comment) */
  @Column({ nullable: true })
  actorId: number;

  @Column({ length: 30 })
  type: 'follow' | 'like' | 'comment' | 'mention' | 'system';

  /** Nội dung mô tả (optional) */
  @Column({ length: 500, nullable: true })
  content: string;

  /** postId liên quan (nếu có) */
  @Column({ nullable: true })
  postId: number;

  @Column({ default: false })
  isRead: boolean;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'actorId' })
  actor: User;

  @CreateDateColumn()
  createdAt: Date;
}
