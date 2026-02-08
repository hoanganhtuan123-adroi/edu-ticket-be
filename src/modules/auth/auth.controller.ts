import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiResponse } from 'src/common/responses/api-response';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorator/auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  
  @Public()
  @Post('login')
  public async login(@Body() dto: LoginDto): Promise<ApiResponse<object>> {
    console.log(`check ::: `)
    const result = await this.authService.login(dto);
    return ApiResponse.success(result, 'Đăng nhập thành công');
  }
}
