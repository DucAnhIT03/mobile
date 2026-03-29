import {
  Controller, Get, Post as HttpPost, Delete, Param, Body,
  UseGuards, Req, BadRequestException, NotFoundException,
  UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { StoryService } from './story.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('stories')
@UseGuards(JwtAuthGuard)
export class StoryController {
  constructor(
    private readonly storyService: StoryService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  /** Đăng story — upload 1 file ảnh/video */
  @HttpPost()
  @UseInterceptors(FileInterceptor('media', {
    storage: memoryStorage(),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/^(image|video)\//)) {
        return cb(new Error('Chỉ chấp nhận file ảnh hoặc video'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  }))
  async createStory(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body('caption') caption: string,
  ) {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn 1 file ảnh hoặc video');
    }

    const result = await this.cloudinaryService.uploadFile(file, 'stories');
    const mediaType = file.mimetype.startsWith('video/') ? 'video' : 'image';

    return this.storyService.create(req.user.userId, {
      mediaUrl: result.secure_url,
      mediaType: mediaType as 'image' | 'video',
      caption: caption || undefined,
    });
  }

  /** Lấy tất cả story còn hiệu lực, gom theo user */
  @Get()
  async getActiveStories(@Req() req: any) {
    return this.storyService.getActiveStories(req.user.userId);
  }

  /** Lấy stories của 1 user */
  @Get('user/:id')
  async getUserStories(@Param('id') id: string, @Req() req: any) {
    return this.storyService.getUserStories(+id, req.user.userId);
  }

  /** Đánh dấu đã xem story */
  @HttpPost(':id/view')
  async markViewed(@Param('id') id: string, @Req() req: any) {
    await this.storyService.markViewed(+id, req.user.userId);
    return { message: 'OK' };
  }

  /** Lấy danh sách người xem */
  @Get(':id/viewers')
  async getViewers(@Param('id') id: string) {
    const viewers = await this.storyService.getViewers(+id);
    // Xóa passwordHash
    viewers.forEach(v => {
      if (v.viewer) delete (v.viewer as any).passwordHash;
    });
    return viewers;
  }

  /** Xóa story của mình */
  @Delete(':id')
  async deleteStory(@Param('id') id: string, @Req() req: any) {
    const deleted = await this.storyService.deleteStory(req.user.userId, +id);
    if (!deleted) {
      throw new NotFoundException('Story không tồn tại hoặc không có quyền xóa');
    }
    return { message: 'Đã xóa story' };
  }
}
