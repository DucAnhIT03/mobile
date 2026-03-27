import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as mysql from 'mysql2/promise';
import * as fs from 'fs';
import { join } from 'path';
import { AppModule } from './app.module';

async function ensureDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  const dbName = process.env.DB_DATABASE || 'mobileapp_chat';
  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
  console.log(`✅ Database "${dbName}" is ready`);
  await connection.end();
}

async function bootstrap() {
  // Đọc .env trước
  require('dotenv').config();

  // Tự động tạo database nếu chưa có
  await ensureDatabase();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Tạo thư mục uploads nếu chưa có
  const uploadsAvatars = join(process.cwd(), 'uploads', 'avatars');
  const uploadsPosts = join(process.cwd(), 'uploads', 'posts');
  if (!fs.existsSync(uploadsAvatars)) fs.mkdirSync(uploadsAvatars, { recursive: true });
  if (!fs.existsSync(uploadsPosts)) fs.mkdirSync(uploadsPosts, { recursive: true });

  // Serve static files (avatars)
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  // Bật CORS cho React Native
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Bật validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`🔌 WebSocket Gateway on ws://localhost:${port}/chat`);
}
bootstrap();
