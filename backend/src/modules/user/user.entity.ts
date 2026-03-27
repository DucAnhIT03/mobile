import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  username: string;

  @Column({ name: 'display_name', length: 100, nullable: true })
  displayName: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash: string;

  @Column({ length: 500, nullable: true })
  avatar: string;

  @Column({ length: 200, nullable: true })
  bio: string;

  @Column({ name: 'is_online', default: false })
  isOnline: boolean;

  @Column({ name: 'last_seen', nullable: true })
  lastSeen: Date;

  @Column({ name: 'username_changed_at', nullable: true })
  usernameChangedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations are defined via forwardRef to avoid circular imports
  @OneToMany('ConversationParticipant', 'user')
  conversationParticipants: any[];

  @OneToMany('Message', 'sender')
  messages: any[];
}
