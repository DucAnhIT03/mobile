import { Controller, Get, Post as HttpPost, Body, Query, UseGuards, Req } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('recommendation')
@UseGuards(JwtAuthGuard)
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  /** GET /recommendation/feed — Feed đề xuất video */
  @Get('feed')
  async getRecommendedFeed(
    @Req() req: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.recommendationService.getRecommendedFeed(
      req.user.sub,
      parseInt(page) || 1,
      parseInt(limit) || 10,
    );
  }

  /** POST /recommendation/interaction — Ghi nhận tương tác video */
  @HttpPost('interaction')
  async trackInteraction(
    @Req() req: any,
    @Body() body: {
      postId: number;
      action: 'view' | 'like' | 'comment' | 'share' | 'skip' | 'replay';
      watchTimeMs?: number;
      videoDurationMs?: number;
    },
  ) {
    return this.recommendationService.trackInteraction(req.user.sub, body);
  }

  /** GET /recommendation/interests — Lấy hồ sơ sở thích user */
  @Get('interests')
  async getUserInterests(@Req() req: any) {
    return this.recommendationService.getUserEmbedding(req.user.sub);
  }
}
