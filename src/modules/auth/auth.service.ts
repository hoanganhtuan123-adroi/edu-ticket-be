import { Injectable, NotFoundException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { comparePassword } from 'src/common/utils/hash.utils';
import { SystemRole } from 'src/models';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<object> {
    const user = await this.userService.findByEmail(dto.email);
    if (!user || !comparePassword(dto.password, user.password)) {
      throw new NotFoundException('Tài khoản hoặc mật khẩu không đúng');
    }

    const payload = { sub: user.id, email: user.email, role: user.systemRole };
    return { accessToken: this.jwtService.sign(payload) };
  }
}
