import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('MAIL_HOST', 'smtp.gmail.com'),
      port: this.configService.get<number>('MAIL_PORT', 587),
      secure: this.configService.get('MAIL_SECURE') === 'true',
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASS'),
      },
    });
  }

  async sendOtp(toEmail: string, otp: string): Promise<void> {
    const from = this.configService.get('MAIL_FROM', 'noreply@connectducanh.com');

    await this.transporter.sendMail({
      from: `"ConnectDucAnh" <${from}>`,
      to: toEmail,
      subject: '🔐 Mã xác thực OTP - ConnectDucAnh',
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: linear-gradient(135deg, #7e22ce, #ec4899); border-radius: 16px; overflow: hidden;">
          <div style="padding: 40px 32px; text-align: center;">
            <h1 style="color: #fff; margin: 0 0 8px 0; font-size: 28px;">ConnectDucAnh</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 0; font-size: 14px;">Xác thực tài khoản của bạn</p>
          </div>
          <div style="background: #fff; padding: 40px 32px; text-align: center;">
            <p style="color: #374151; font-size: 16px; margin: 0 0 24px 0;">Mã OTP của bạn là:</p>
            <div style="background: #f3f4f6; border-radius: 12px; padding: 20px; margin: 0 0 24px 0;">
              <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #7e22ce;">${otp}</span>
            </div>
            <p style="color: #9ca3af; font-size: 13px; margin: 0;">Mã có hiệu lực trong <strong>5 phút</strong>.</p>
            <p style="color: #9ca3af; font-size: 13px; margin: 8px 0 0 0;">Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email.</p>
          </div>
        </div>
      `,
    });
  }
}
