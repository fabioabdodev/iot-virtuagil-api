import { Body, Controller, Get, Headers, Post, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ConfirmPasswordResetDto } from './dto/confirm-password-reset.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Headers('cf-connecting-ip') cfConnectingIp?: string,
    @Headers('x-forwarded-for') xForwardedFor?: string,
  ) {
    return this.authService.login(dto, {
      ipAddress: this.resolveIpAddress(cfConnectingIp, xForwardedFor),
    });
  }

  @Get('me')
  async me(@Headers('authorization') authorization?: string) {
    return this.authService.me(authorization);
  }

  @Post('password/forgot')
  async forgotPassword(
    @Body() dto: RequestPasswordResetDto,
    @Headers('cf-connecting-ip') cfConnectingIp?: string,
    @Headers('x-forwarded-for') xForwardedFor?: string,
  ) {
    return this.authService.requestPasswordReset(dto, {
      ipAddress: this.resolveIpAddress(cfConnectingIp, xForwardedFor),
    });
  }

  @Get('password/reset/validate')
  async validateResetToken(@Query('token') token?: string) {
    return this.authService.validatePasswordResetToken(token);
  }

  @Post('password/reset')
  async resetPassword(@Body() dto: ConfirmPasswordResetDto) {
    return this.authService.resetPassword(dto);
  }

  private resolveIpAddress(
    cfConnectingIp?: string,
    xForwardedFor?: string,
  ) {
    if (cfConnectingIp?.trim()) return cfConnectingIp.trim();

    const forwarded = xForwardedFor
      ?.split(',')
      .map((value) => value.trim())
      .find(Boolean);

    return forwarded || 'unknown';
  }
}
