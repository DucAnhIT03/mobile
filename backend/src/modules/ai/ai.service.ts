import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly apiKey: string;
  private readonly model: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get('GEMINI_API_KEY', '');
    this.model = this.configService.get('GEMINI_MODEL', 'gemini-2.0-flash');
    this.logger.log(`AI Service initialized. API Key present: ${!!this.apiKey}, Model: ${this.model}`);
  }

  async chat(
    messages: { role: 'user' | 'model'; text: string }[],
  ): Promise<string> {
    if (!this.apiKey) {
      this.logger.warn('GEMINI_API_KEY is missing in .env');
      return 'AI chưa được cấu hình. Vui lòng thêm GEMINI_API_KEY vào file .env';
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

      const contents = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));

      const body = {
        contents,
        systemInstruction: {
          parts: [{
            text: `Bạn là AI Assistant của ứng dụng ConnectDucAnh - một mạng xã hội Việt Nam.
Hãy trả lời bằng tiếng Việt trừ khi người dùng hỏi bằng ngôn ngữ khác.
Trả lời ngắn gọn, hữu ích và thân thiện. Sử dụng emoji phù hợp.
Bạn có thể giúp: trả lời câu hỏi, viết nội dung, giải thích khái niệm, viết code, dịch ngôn ngữ, gợi ý ý tưởng.
Nếu được hỏi bạn là ai, hãy nói bạn là trợ lý AI của ConnectDucAnh.`,
          }],
        },
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 2048,
        },
      };

      this.logger.log(`Calling Gemini API: ${this.model}, messages: ${messages.length}`);

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        const errDetail = (data as any)?.error?.message || JSON.stringify(data);
        this.logger.error(`Gemini API error ${response.status}: ${errDetail}`);
        return `Lỗi AI: ${errDetail} 😔`;
      }

      const text = (data as any)?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        this.logger.warn('Gemini returned empty response');
        return 'Xin lỗi, tôi không thể trả lời câu hỏi này. Hãy thử hỏi khác nhé! 🤔';
      }

      return text;
    } catch (error: any) {
      this.logger.error(`AI chat error: ${error.message}`);
      return `Đã xảy ra lỗi khi kết nối AI: ${error.message} 🔄`;
    }
  }
}
