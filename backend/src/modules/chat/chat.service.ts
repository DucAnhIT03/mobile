import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { ConversationParticipant } from './entities/conversation-participant.entity';
import { Message } from './entities/message.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepo: Repository<Conversation>,
    @InjectRepository(ConversationParticipant)
    private readonly participantRepo: Repository<ConversationParticipant>,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
  ) {}

  /**
   * Lấy danh sách cuộc hội thoại của user
   */
  async getConversations(userId: number) {
    const participations = await this.participantRepo.find({
      where: { userId },
      relations: ['conversation', 'conversation.participants', 'conversation.participants.user', 'conversation.messages'],
    });

    return participations.map((p) => {
      const conv = p.conversation;
      const otherParticipants = conv.participants
        .filter((cp) => cp.userId !== userId)
        .map((cp) => ({
          id: cp.user.id,
          username: cp.user.username,
          displayName: cp.user.displayName,
          avatar: cp.user.avatar,
          isOnline: cp.user.isOnline,
        }));

      // Lấy tin nhắn cuối cùng
      const lastMessage = conv.messages && conv.messages.length > 0
        ? conv.messages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
        : null;

      // Đếm tin nhắn chưa đọc
      const unreadCount = conv.messages
        ? conv.messages.filter((m) => !m.isRead && m.senderId !== userId).length
        : 0;

      return {
        id: conv.id,
        type: conv.type,
        name: conv.type === 'group' ? conv.name : (otherParticipants[0]?.displayName || otherParticipants[0]?.username),
        avatar: conv.type === 'group' ? conv.avatar : otherParticipants[0]?.avatar,
        isOnline: conv.type === 'private' ? otherParticipants[0]?.isOnline : false,
        participants: otherParticipants,
        lastMessage: lastMessage
          ? {
              id: lastMessage.id,
              content: lastMessage.content,
              type: lastMessage.type,
              senderId: lastMessage.senderId,
              createdAt: lastMessage.createdAt,
            }
          : null,
        unreadCount,
        updatedAt: conv.updatedAt,
      };
    }).sort((a, b) => {
      const timeA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const timeB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  }

  /**
   * Lấy lịch sử tin nhắn của cuộc hội thoại
   */
  async getMessages(conversationId: number, userId: number, page = 1, limit = 50) {
    // Kiểm tra user có trong cuộc hội thoại không
    const participant = await this.participantRepo.findOne({
      where: { conversationId, userId },
    });
    if (!participant) return [];

    const messages = await this.messageRepo.find({
      where: { conversationId },
      relations: ['sender'],
      order: { createdAt: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return messages.map((m) => ({
      id: m.id,
      conversationId: m.conversationId,
      senderId: m.senderId,
      senderName: m.sender?.username,
      senderAvatar: m.sender?.avatar,
      content: m.content,
      type: m.type,
      isRead: m.isRead,
      createdAt: m.createdAt,
      isMine: m.senderId === userId,
    }));
  }

  /**
   * Tạo cuộc hội thoại mới (private 1-1)
   */
  async createConversation(userId: number, targetUserId: number) {
    // Kiểm tra nếu đã có cuộc hội thoại private giữa 2 user
    const existing = await this.findPrivateConversation(userId, targetUserId);
    if (existing) return existing;

    // Tạo conversation mới
    const conversation = this.conversationRepo.create({ type: 'private' });
    await this.conversationRepo.save(conversation);

    // Thêm 2 participants
    const p1 = this.participantRepo.create({ conversationId: conversation.id, userId });
    const p2 = this.participantRepo.create({ conversationId: conversation.id, userId: targetUserId });
    await this.participantRepo.save([p1, p2]);

    return { id: conversation.id, type: 'private' };
  }

  /**
   * Tìm cuộc hội thoại private giữa 2 user
   */
  async findPrivateConversation(userId1: number, userId2: number) {
    const result = await this.conversationRepo
      .createQueryBuilder('c')
      .innerJoin('c.participants', 'p1', 'p1.userId = :uid1', { uid1: userId1 })
      .innerJoin('c.participants', 'p2', 'p2.userId = :uid2', { uid2: userId2 })
      .where('c.type = :type', { type: 'private' })
      .getOne();

    return result ? { id: result.id, type: result.type } : null;
  }

  /**
   * Gửi tin nhắn
   */
  async sendMessage(conversationId: number, senderId: number, content: string, type: 'text' | 'image' | 'video' = 'text') {
    const message = this.messageRepo.create({
      conversationId,
      senderId,
      content,
      type,
    });
    const saved = await this.messageRepo.save(message);

    // Cập nhật thời gian conversation
    await this.conversationRepo.update(conversationId, { updatedAt: new Date() });

    // Load sender info
    const fullMessage = await this.messageRepo.findOne({
      where: { id: saved.id },
      relations: ['sender'],
    });

    return {
      id: fullMessage!.id,
      conversationId: fullMessage!.conversationId,
      senderId: fullMessage!.senderId,
      senderName: fullMessage!.sender?.username,
      senderAvatar: fullMessage!.sender?.avatar,
      content: fullMessage!.content,
      type: fullMessage!.type,
      isRead: fullMessage!.isRead,
      createdAt: fullMessage!.createdAt,
    };
  }

  /**
   * Đánh dấu tin nhắn đã đọc
   */
  async markAsRead(conversationId: number, userId: number) {
    await this.messageRepo
      .createQueryBuilder()
      .update(Message)
      .set({ isRead: true })
      .where('conversation_id = :conversationId AND sender_id != :userId AND is_read = false', {
        conversationId,
        userId,
      })
      .execute();
  }

  /**
   * Lấy danh sách user IDs trong conversation (để emit socket events)
   */
  async getConversationUserIds(conversationId: number): Promise<number[]> {
    const participants = await this.participantRepo.find({
      where: { conversationId },
    });
    return participants.map((p) => p.userId);
  }
}
