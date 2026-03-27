import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  async getConversations(@Req() req: any) {
    return this.chatService.getConversations(req.user.userId);
  }

  @Get('conversations/:id/messages')
  async getMessages(
    @Param('id') id: string,
    @Query('page') page: string,
    @Req() req: any,
  ) {
    return this.chatService.getMessages(
      parseInt(id),
      req.user.userId,
      page ? parseInt(page) : 1,
    );
  }

  @Post('conversations')
  async createConversation(
    @Body('targetUserId') targetUserId: number,
    @Req() req: any,
  ) {
    return this.chatService.createConversation(req.user.userId, targetUserId);
  }

  @Post('conversations/:id/read')
  async markAsRead(@Param('id') id: string, @Req() req: any) {
    await this.chatService.markAsRead(parseInt(id), req.user.userId);
    return { success: true };
  }
}
