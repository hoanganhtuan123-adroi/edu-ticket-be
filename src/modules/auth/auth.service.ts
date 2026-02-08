import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { comparePassword } from 'src/common/utils/hash.utils';
import { SystemRole } from 'src/models';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlacklistedToken } from 'src/models/blacklisted-token.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @InjectRepository(BlacklistedToken)
    private readonly blacklistedTokenRepository: Repository<BlacklistedToken>,
  ) {}

  async login(dto: LoginDto): Promise<object> {
    const user = await this.userService.findByEmail(dto.email);
    
    // Check if user exists
    if (!user) {
      throw new NotFoundException('Tài khoản hoặc mật khẩu không đúng');
    }
    
    // Compare password
    const isPasswordValid = await comparePassword(dto.password, user.password);
    if (!isPasswordValid) {
      throw new NotFoundException('Tài khoản hoặc mật khẩu không đúng');
    }

    const payload = { sub: user.id, email: user.email, role: user.systemRole };
    return { accessToken: this.jwtService.sign(payload) };
  }

  async verifyToken(token: string): Promise<object> {
    try {
      const payload = this.jwtService.verify(token);
      
      // Check if token is blacklisted
      const isBlacklisted = await this.blacklistedTokenRepository.findOne({
        where: { token }
      });
      
      if (isBlacklisted) {
        throw new UnauthorizedException('Token đã bị vô hiệu hóa');
      }
      
      return {
        payload: {
          userId: payload.sub,
          email: payload.email,
          role: payload.role
        }
      };
    } catch (error) {
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }
  }

  async logout(dto: LogoutDto): Promise<object> {
    try {
      // Verify the token to get expiration time
      const payload = this.jwtService.verify(dto.token);
      
      // Add token to blacklist with expiration time
      const blacklistedToken = new BlacklistedToken();
      blacklistedToken.token = dto.token;
      blacklistedToken.expiresAt = new Date(payload.exp * 1000); // Convert to milliseconds
      blacklistedToken.userId = payload.sub.toString();
      
      await this.blacklistedTokenRepository.save(blacklistedToken);
      
      return { message: 'Đăng xuất thành công' };
    } catch (error) {
      // Even if token is invalid, we still return success for logout
      return { message: 'Đăng xuất thành công' };
    }
  }
}
