import { Controller, Get, Post, Param, Query, Req, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /** Lấy danh sách thông báo */
  @Get()
  async getNotifications(@Req() req: any, @Query('page') page: string) {
    return this.notificationService.getMyNotifications(req.user.userId, parseInt(page) || 1);
  }

  /** Đếm thông báo chưa đọc */
  @Get('unread-count')
  async getUnreadCount(@Req() req: any) {
    const count = await this.notificationService.countUnread(req.user.userId);
    return { count };
  }

  /** Đánh dấu tất cả đã đọc */
  @Post('mark-all-read')
  async markAllRead(@Req() req: any) {
    await this.notificationService.markAllAsRead(req.user.userId);
    return { message: 'Đã đánh dấu tất cả đã đọc' };
  }

  /** Đánh dấu 1 thông báo đã đọc */
  @Post(':id/read')
  async markAsRead(@Param('id') id: string, @Req() req: any) {
    await this.notificationService.markAsRead(req.user.userId, +id);
    return { message: 'Đã đọc' };
  }
}
