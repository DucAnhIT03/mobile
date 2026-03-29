import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from '../user/user.entity';
import { Story } from './story.entity';

@Entity('story_views')
@Unique(['storyId', 'viewerId'])
export class StoryView {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'story_id' })
  storyId: number;

  @ManyToOne(() => Story, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'story_id' })
  story: Story;

  @Column({ name: 'viewer_id' })
  viewerId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'viewer_id' })
  viewer: User;

  @CreateDateColumn({ name: 'viewed_at' })
  viewedAt: Date;
}
