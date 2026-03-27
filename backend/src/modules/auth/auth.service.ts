import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { MailService } from './mail.service';
import { OtpCode } from './otp-code.entity';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { VerifyOtpDto } from './dtos/verify-otp.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    @InjectRepository(OtpCode)
    private readonly otpRepo: Repository<OtpCode>,
  ) {}

  /**
   * Tạo username tự động từ displayName + số ngẫu nhiên (kiểu Instagram)
   * VD: "Nguyễn Đức Anh" -> "nguyenducanh_38291"
   */
  private async generateUsername(displayName: string): Promise<string> {
    // Chuyển tên thành dạng không dấu, lowercase, bỏ khoảng trắng
    const base = this.removeVietnameseTones(displayName)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 20);

    // Thử tạo username unique (tối đa 10 lần)
    for (let i = 0; i < 10; i++) {
      const randomNum = Math.floor(10000 + Math.random() * 90000); // 5 chữ số
      const username = `${base}_${randomNum}`;
      const existing = await this.userService.findByUsername(username);
      if (!existing) {
        return username;
      }
    }

    // Fallback: dùng timestamp
    return `${base}_${Date.now()}`;
  }

  /**
   * Bỏ dấu tiếng Việt
   */
  private removeVietnameseTones(str: string): string {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
  }

  /**
   * Bước 1: Đăng ký - gửi OTP qua email
   */
  async register(dto: RegisterDto) {
    // Kiểm tra email đã tồn tại
    const existingEmail = await this.userService.findByEmail(dto.email);
    if (existingEmail) {
      throw new ConflictException('Email đã được sử dụng');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    // Tạo mã OTP 6 kí tự (chỉ số)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Xóa OTP cũ của email này (nếu có)
    await this.otpRepo.delete({ email: dto.email });

    // Lưu OTP vào database (hết hạn sau 5 phút)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const otpRecord = this.otpRepo.create({
      email: dto.email,
      code: otp,
      username: '', // Sẽ được tạo tự động khi verify OTP
      displayName: dto.displayName,
      passwordHash,
      expiresAt,
    });
    await this.otpRepo.save(otpRecord);

    // Gửi OTP qua email
    await this.mailService.sendOtp(dto.email, otp);

    return {
      message: 'Mã OTP đã được gửi đến email của bạn',
      email: dto.email,
    };
  }

  /**
   * Bước 2: Xác thực OTP - tạo tài khoản
   */
  async verifyOtp(dto: VerifyOtpDto) {
    // Tìm OTP hợp lệ (chưa dùng, chưa hết hạn)
    const otpRecord = await this.otpRepo.findOne({
      where: {
        email: dto.email,
        code: dto.code,
        used: false,
        expiresAt: MoreThan(new Date()),
      },
    });

    if (!otpRecord) {
      throw new BadRequestException('Mã OTP không hợp lệ hoặc đã hết hạn');
    }

    // Đánh dấu OTP đã dùng
    otpRecord.used = true;
    await this.otpRepo.save(otpRecord);

    // Tạo username tự động từ displayName
    const username = await this.generateUsername(otpRecord.displayName || 'user');

    // Tạo user thật
    const user = await this.userService.create({
      username,
      displayName: otpRecord.displayName,
      email: otpRecord.email,
      passwordHash: otpRecord.passwordHash,
      avatar: `https://i.pravatar.cc/150?u=${username}`,
    });

    // Tạo JWT token
    const payload = { userId: user.id, username: user.username };
    const token = this.jwtService.sign(payload);

    return {
      message: 'Đăng ký thành công',
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        avatar: user.avatar,
      },
      token,
    };
  }

  /**
   * Gửi lại OTP
   */
  async resendOtp(email: string) {
    // Tìm OTP gần nhất của email
    const existing = await this.otpRepo.findOne({
      where: { email, used: false },
      order: { createdAt: 'DESC' },
    });

    if (!existing) {
      throw new BadRequestException('Không tìm thấy yêu cầu đăng ký. Vui lòng đăng ký lại.');
    }

    // Tạo OTP mới
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    existing.code = otp;
    existing.expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await this.otpRepo.save(existing);

    // Gửi lại email
    await this.mailService.sendOtp(email, otp);

    return { message: 'Mã OTP mới đã được gửi' };
  }

  /**
   * Đăng nhập
   */
  async login(dto: LoginDto) {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Tài khoản hoặc mật khẩu của bạn không chính xác');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Tài khoản hoặc mật khẩu của bạn không chính xác');
    }

    // Cập nhật trạng thái online
    await this.userService.setOnline(user.id, true);

    // Tạo JWT token
    const payload = { userId: user.id, username: user.username };
    const token = this.jwtService.sign(payload);

    return {
      message: 'Đăng nhập thành công',
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        avatar: user.avatar,
      },
      token,
    };
  }
}
