import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { UserService } from '../user/user.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Map socket.id -> userId
  private connectedUsers = new Map<string, number>();
  // Map userId -> socket.id[]
  private userSockets = new Map<number, string[]>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly chatService: ChatService,
    private readonly userService: UserService,
  ) {}

  /**
   * Khi client kết nối WebSocket
   */
  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.query?.token;
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token as string);
      const userId = payload.userId;

      // Lưu mapping
      this.connectedUsers.set(client.id, userId);
      const sockets = this.userSockets.get(userId) || [];
      sockets.push(client.id);
      this.userSockets.set(userId, sockets);

      // Cập nhật trạng thái online
      await this.userService.setOnline(userId, true);

      // Thông báo cho tất cả client biết user online
      this.server.emit('userOnline', { userId });

      console.log(`User ${userId} connected (socket: ${client.id})`);
    } catch (error) {
      console.log('WebSocket auth failed:', error.message);
      client.disconnect();
    }
  }

  /**
   * Khi client ngắt kết nối
   */
  async handleDisconnect(client: Socket) {
    const userId = this.connectedUsers.get(client.id);
    if (!userId) return;

    // Xóa socket khỏi mapping
    this.connectedUsers.delete(client.id);
    const sockets = this.userSockets.get(userId) || [];
    const remaining = sockets.filter((id) => id !== client.id);

    if (remaining.length === 0) {
      this.userSockets.delete(userId);
      // Chỉ set offline khi không còn socket nào
      await this.userService.setOnline(userId, false);
      this.server.emit('userOffline', { userId });
    } else {
      this.userSockets.set(userId, remaining);
    }

    console.log(`User ${userId} disconnected (socket: ${client.id})`);
  }

  /**
   * Client tham gia room (conversation)
   */
  @SubscribeMessage('joinConversation')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: number },
  ) {
    const roomId = `conversation_${data.conversationId}`;
    client.join(roomId);
    console.log(`Socket ${client.id} joined room ${roomId}`);
  }

  /**
   * Client rời room
   */
  @SubscribeMessage('leaveConversation')
  async handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: number },
  ) {
    const roomId = `conversation_${data.conversationId}`;
    client.leave(roomId);
  }

  /**
   * Client gửi tin nhắn
   */
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: number; content: string; type?: 'text' | 'image' | 'video' },
  ) {
    const userId = this.connectedUsers.get(client.id);
    if (!userId) return;

    const message = await this.chatService.sendMessage(
      data.conversationId,
      userId,
      data.content,
      data.type || 'text',
    );

    const roomId = `conversation_${data.conversationId}`;

    // Gửi tin nhắn đến tất cả user trong room
    this.server.to(roomId).emit('newMessage', message);

    // Gửi thông báo cho tất cả user trong conversation (kể cả không trong room)
    const userIds = await this.chatService.getConversationUserIds(data.conversationId);
    for (const uid of userIds) {
      const sockets = this.userSockets.get(uid) || [];
      for (const socketId of sockets) {
        this.server.to(socketId).emit('conversationUpdated', {
          conversationId: data.conversationId,
          lastMessage: message,
        });
      }
    }

    return message;
  }

  /**
   * Client đang gõ
   */
  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: number; isTyping: boolean },
  ) {
    const userId = this.connectedUsers.get(client.id);
    if (!userId) return;

    const user = await this.userService.findById(userId);
    const roomId = `conversation_${data.conversationId}`;

    client.to(roomId).emit('userTyping', {
      conversationId: data.conversationId,
      userId,
      username: user?.username,
      isTyping: data.isTyping,
    });
  }

  /**
   * Client đánh dấu đã đọc
   */
  @SubscribeMessage('markRead')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: number },
  ) {
    const userId = this.connectedUsers.get(client.id);
    if (!userId) return;

    await this.chatService.markAsRead(data.conversationId, userId);

    const roomId = `conversation_${data.conversationId}`;
    this.server.to(roomId).emit('messagesRead', {
      conversationId: data.conversationId,
      userId,
    });
  }

  // =================== CALL SIGNALING ===================

  /**
   * Gọi cho user (voice/video)
   */
  @SubscribeMessage('callUser')
  async handleCallUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { targetUserId: number; callType: 'voice' | 'video'; conversationId: number },
  ) {
    const callerId = this.connectedUsers.get(client.id);
    if (!callerId) return;

    const caller = await this.userService.findById(callerId);
    const targetSockets = this.userSockets.get(data.targetUserId) || [];

    if (targetSockets.length === 0) {
      // User offline
      client.emit('callFailed', { reason: 'Người dùng không online' });
      return;
    }

    // Gửi incoming call đến target user
    for (const socketId of targetSockets) {
      this.server.to(socketId).emit('incomingCall', {
        callerId,
        callerName: caller?.displayName || caller?.username,
        callerAvatar: caller?.avatar,
        callType: data.callType,
        conversationId: data.conversationId,
      });
    }

    client.emit('callRinging', { targetUserId: data.targetUserId });
  }

  /**
   * Chấp nhận cuộc gọi
   */
  @SubscribeMessage('acceptCall')
  async handleAcceptCall(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { callerId: number },
  ) {
    const userId = this.connectedUsers.get(client.id);
    if (!userId) return;

    const callerSockets = this.userSockets.get(data.callerId) || [];
    for (const socketId of callerSockets) {
      this.server.to(socketId).emit('callAccepted', { userId });
    }
  }

  /**
   * Từ chối cuộc gọi
   */
  @SubscribeMessage('rejectCall')
  async handleRejectCall(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { callerId: number },
  ) {
    const userId = this.connectedUsers.get(client.id);
    if (!userId) return;

    const callerSockets = this.userSockets.get(data.callerId) || [];
    for (const socketId of callerSockets) {
      this.server.to(socketId).emit('callRejected', { userId });
    }
  }

  /**
   * Kết thúc cuộc gọi
   */
  @SubscribeMessage('endCall')
  async handleEndCall(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { targetUserId: number },
  ) {
    const userId = this.connectedUsers.get(client.id);
    if (!userId) return;

    const targetSockets = this.userSockets.get(data.targetUserId) || [];
    for (const socketId of targetSockets) {
      this.server.to(socketId).emit('callEnded', { userId });
    }
  }

  /**
   * WebRTC SDP offer
   */
  @SubscribeMessage('callOffer')
  async handleCallOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { targetUserId: number; sdp: any },
  ) {
    const userId = this.connectedUsers.get(client.id);
    if (!userId) return;

    const targetSockets = this.userSockets.get(data.targetUserId) || [];
    for (const socketId of targetSockets) {
      this.server.to(socketId).emit('callOffer', { userId, sdp: data.sdp });
    }
  }

  /**
   * WebRTC SDP answer
   */
  @SubscribeMessage('callAnswer')
  async handleCallAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { targetUserId: number; sdp: any },
  ) {
    const userId = this.connectedUsers.get(client.id);
    if (!userId) return;

    const targetSockets = this.userSockets.get(data.targetUserId) || [];
    for (const socketId of targetSockets) {
      this.server.to(socketId).emit('callAnswer', { userId, sdp: data.sdp });
    }
  }

  /**
   * WebRTC ICE candidate
   */
  @SubscribeMessage('iceCandidate')
  async handleIceCandidate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { targetUserId: number; candidate: any },
  ) {
    const userId = this.connectedUsers.get(client.id);
    if (!userId) return;

    const targetSockets = this.userSockets.get(data.targetUserId) || [];
    for (const socketId of targetSockets) {
      this.server.to(socketId).emit('iceCandidate', { userId, candidate: data.candidate });
    }
  }
}
