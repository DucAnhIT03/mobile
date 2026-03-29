import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from '../post/post.entity';
import { VideoInteraction } from '../post/video-interaction.entity';
import { UserInterest } from '../post/user-interest.entity';
import { User } from '../user/user.entity';
import { RecommendationService } from './recommendation.service';
import { RecommendationController } from './recommendation.controller';
import { VideoSeederService } from './video-seeder.service';

@Module({
  imports: [TypeOrmModule.forFeature([Post, VideoInteraction, UserInterest, User])],
  controllers: [RecommendationController],
  providers: [RecommendationService, VideoSeederService],
  exports: [RecommendationService],
})
export class RecommendationModule {}
