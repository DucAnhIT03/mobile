import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  async chat(
    @Body() body: { messages: { role: 'user' | 'model'; text: string }[] },
  ) {
    const reply = await this.aiService.chat(body.messages || []);
    return { reply };
  }
}
