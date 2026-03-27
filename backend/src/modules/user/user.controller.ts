import { Controller, Get, Put, Post, Delete, Query, Param, Body, UseGuards, Req, BadRequestException, NotFoundException, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UserService } from './user.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get('me')
  async getMe(@Req() req: any) {
    const profile = await this.userService.getProfile(req.user.userId);
    if (!profile) return null;
    return profile;
  }

  @Get('search')
  async search(@Query('q') query: string, @Req() req: any) {
    if (!query || query.trim().length === 0) {
      return [];
    }
    return this.userService.search(query, req.user.userId);
  }

  @Get()
  async findAll() {
    return this.userService.findAll();
  }

  // === Profile ===

  @Get(':id/profile')
  async getProfile(@Param('id') id: string, @Req() req: any) {
    const profile = await this.userService.getProfile(+id, req.user.userId);
    if (!profile) {
      throw new NotFoundException('Người dùng không tồn tại');
    }
    return profile;
  }

  @Put('me/profile')
  async updateProfile(@Req() req: any, @Body() body: { displayName?: string; bio?: string; avatar?: string; username?: string }) {
    try {
      return await this.userService.updateProfile(req.user.userId, body);
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('avatar', {
    storage: memoryStorage(),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
        return cb(new Error('Chỉ chấp nhận file ảnh'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  }))
  async uploadAvatar(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn ảnh');
    }
    const result = await this.cloudinaryService.uploadFile(file, 'avatars');
    return this.userService.updateProfile(req.user.userId, { avatar: result.secure_url });
  }

  // === Follow ===

  @Get(':id/followers')
  async getFollowers(@Param('id') id: string, @Req() req: any) {
    return this.userService.getFollowers(+id, req.user.userId);
  }

  @Get(':id/following')
  async getFollowing(@Param('id') id: string, @Req() req: any) {
    return this.userService.getFollowing(+id, req.user.userId);
  }

  @Post(':id/follow')
  async follow(@Param('id') id: string, @Req() req: any) {
    try {
      return await this.userService.follow(req.user.userId, +id);
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  @Delete(':id/follow')
  async unfollow(@Param('id') id: string, @Req() req: any) {
    return this.userService.unfollow(req.user.userId, +id);
  }
}
