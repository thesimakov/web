import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RefreshDto, SignupDto } from './dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('signup')
  async signup(@Body() dto: SignupDto) {
    const user = await this.auth.signup(dto.email, dto.password);
    return { user };
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const email = dto.email === 'demo' ? 'demo@lmnt.dev' : dto.email;
    return await this.auth.login(email, dto.password);
  }

  @Post('refresh')
  async refresh(@Body() dto: RefreshDto) {
    return await this.auth.refresh(dto.refreshToken);
  }

  @Post('logout')
  async logout(@Body() dto: RefreshDto) {
    return await this.auth.logout(dto.refreshToken);
  }
}

