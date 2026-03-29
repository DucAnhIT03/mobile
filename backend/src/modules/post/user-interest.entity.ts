import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from '../user/user.entity';

@Entity('user_interests')
@Unique(['userId', 'category'])
export class UserInterest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ length: 50 })
  category: string; // 'funny', 'game', 'education', 'music', 'travel', 'food', 'tech', 'sport', 'fashion', 'art'

  @Column({ type: 'float', default: 0 })
  score: number; // 0.0 - 1.0

  @Column({ name: 'interaction_count', default: 0 })
  interactionCount: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
