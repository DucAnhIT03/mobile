import {
  Controller, Get, Post as HttpPost, Delete, Query, Param, Body,
  UseGuards, Req, BadRequestException, NotFoundException,
  UseInterceptors, UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PostService } from './post.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  /** Tạo bài viết — upload lên Cloudinary */
  @HttpPost()
  @UseInterceptors(FilesInterceptor('media', 10, {
    storage: memoryStorage(),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/^(image|video)\//)) {
        return cb(new Error('Chỉ chấp nhận file ảnh hoặc video'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  }))
  async createPost(
    @Req() req: any,
    @UploadedFiles() files: Express.Multer.File[],
    @Body('caption') caption: string,
    @Body('type') type: string,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Vui lòng chọn ít nhất 1 file');
    }

    const results = await this.cloudinaryService.uploadFiles(files, 'posts');
    const media = results.map(r => r.secure_url);
    const postType = (type === 'video' ? 'video' : 'image') as 'image' | 'video';

    let thumbnail: string | undefined;
    if (postType === 'video') {
      const videoResult = results.find(r => r.resource_type === 'video');
      if (videoResult) {
        thumbnail = videoResult.secure_url.replace(/\.\w+$/, '.jpg');
      }
    }

    return this.postService.create(req.user.userId, {
      caption: caption || '',
      type: postType,
      media,
      thumbnail,
    });
  }

  /** Feed chung */
  @Get()
  async getFeed(@Query('page') page: string) {
    return this.postService.getFeed(parseInt(page) || 1);
  }

  /** Video Reels feed */
  @Get('reels')
  async getReels(@Query('page') page: string) {
    return this.postService.getReels(parseInt(page) || 1);
  }

  /** Tạo bài viết từ URL (không cần upload file) */
  @HttpPost('from-url')
  async createPostFromUrl(
    @Req() req: any,
    @Body() body: { caption: string; type: 'image' | 'video'; mediaUrls: string[]; thumbnail?: string },
  ) {
    if (!body.mediaUrls || body.mediaUrls.length === 0) {
      throw new BadRequestException('Vui lòng cung cấp ít nhất 1 URL');
    }
    return this.postService.createFromUrl(req.user.userId, body);
  }

  /** Posts của 1 user */
  @Get('user/:id')
  async getUserPosts(@Param('id') id: string, @Query('page') page: string) {
    return this.postService.getUserPosts(+id, parseInt(page) || 1);
  }

  /** Xóa bài viết */
  @Delete(':id')
  async deletePost(@Param('id') id: string, @Req() req: any) {
    const deleted = await this.postService.deletePost(req.user.userId, +id);
    if (!deleted) {
      throw new NotFoundException('Bài viết không tồn tại hoặc không có quyền xóa');
    }
    return { message: 'Đã xóa bài viết' };
  }

  // =================== LIKE ===================

  /** Toggle like bài viết */
  @HttpPost(':id/like')
  async toggleLike(@Param('id') id: string, @Req() req: any) {
    return this.postService.toggleLike(req.user.userId, +id);
  }

  /** Kiểm tra đã like chưa */
  @Get(':id/liked')
  async isLiked(@Param('id') id: string, @Req() req: any) {
    const liked = await this.postService.isLikedByUser(req.user.userId, +id);
    return { liked };
  }

  // =================== COMMENT ===================

  /** Lấy danh sách comment */
  @Get(':id/comments')
  async getComments(@Param('id') id: string, @Query('page') page: string) {
    return this.postService.getComments(+id, parseInt(page) || 1);
  }

  /** Thêm comment */
  @HttpPost(':id/comments')
  async addComment(
    @Param('id') id: string,
    @Req() req: any,
    @Body('content') content: string,
  ) {
    if (!content?.trim()) {
      throw new BadRequestException('Nội dung bình luận không được trống');
    }
    return this.postService.addComment(req.user.userId, +id, content.trim());
  }

  /** Xóa comment */
  @Delete('comments/:commentId')
  async deleteComment(@Param('commentId') commentId: string, @Req() req: any) {
    const deleted = await this.postService.deleteComment(req.user.userId, +commentId);
    if (!deleted) {
      throw new NotFoundException('Bình luận không tồn tại hoặc không có quyền xóa');
    }
    return { message: 'Đã xóa bình luận' };
  }

  // =================== ACTIVITY HISTORY ===================

  /** Lấy lịch sử like của user hiện tại */
  @Get('activity/my-likes')
  async getMyLikes(@Req() req: any, @Query('page') page: string) {
    return this.postService.getUserLikes(req.user.userId, parseInt(page) || 1);
  }

  /** Bỏ like theo likeId */
  @Delete('activity/my-likes/:likeId')
  async unlikeByLikeId(@Param('likeId') likeId: string, @Req() req: any) {
    const result = await this.postService.unlikeByLikeId(req.user.userId, +likeId);
    if (!result) {
      throw new NotFoundException('Không tìm thấy lượt thích');
    }
    return { message: 'Đã bỏ thích' };
  }

  /** Lấy lịch sử comment của user hiện tại */
  @Get('activity/my-comments')
  async getMyComments(@Req() req: any, @Query('page') page: string) {
    return this.postService.getUserComments(req.user.userId, parseInt(page) || 1);
  }
}
