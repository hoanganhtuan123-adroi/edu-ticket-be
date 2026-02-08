import { Body, Controller, Post, Get, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiResponse } from 'src/common/responses/api-response';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { Public } from './decorator/auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Public()
  @Post('login')
  public async login(@Body() dto: LoginDto): Promise<ApiResponse<object>> {
    const result = await this.authService.login(dto);
    return ApiResponse.success(result, 'Đăng nhập thành công');
  }

  @Public()
  @Post('verify')
  public async verifyToken(@Headers('authorization') authHeader: string): Promise<ApiResponse<object>> {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ApiResponse.error('Token không được cung cấp hoặc định dạng không đúng');
    }

    const token = authHeader.substring(7);
    const result = await this.authService.verifyToken(token);
    return ApiResponse.success(result, 'Token hợp lệ');
  }

  @Public()
  @Post('logout')
  public async logout(@Body() dto: LogoutDto): Promise<ApiResponse<object>> {
    const result = await this.authService.logout(dto);
    return ApiResponse.success(result);
  }
}
