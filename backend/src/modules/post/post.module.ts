import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './post.entity';
import { Like } from './like.entity';
import { Comment } from './comment.entity';
import { Bookmark } from './bookmark.entity';
import { PostService } from './post.service';
import { PostController } from './post.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Like, Comment, Bookmark])],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule {}
