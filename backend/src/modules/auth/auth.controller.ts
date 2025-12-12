import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({
    summary: 'Yeni kullanıcı kaydı',
    description:
      'Yeni bir kullanıcı hesabı oluşturur ve doğrulama e-postası gönderir.',
  })
  @ApiBody({ type: SignupDto })
  @ApiResponse({ status: 201, description: 'Kullanıcı başarıyla oluşturuldu.' })
  @ApiResponse({ status: 400, description: 'Geçersiz giriş verileri.' })
  @ApiResponse({ status: 409, description: 'E-posta adresi zaten kullanımda.' })
  @ApiResponse({
    status: 429,
    description: 'Çok fazla istek. Lütfen bekleyin.',
  })
  @Throttle({
    short: { limit: 2, ttl: 1000 },
    medium: { limit: 5, ttl: 60000 },
  })
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Kullanıcı girişi',
    description: 'E-posta ve şifre ile giriş yapar, JWT token döner.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Giriş başarılı. Access ve refresh token döner.',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 'uuid',
          email: 'user@example.com',
          name: 'John Doe',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Geçersiz kimlik bilgileri.' })
  @ApiResponse({
    status: 429,
    description: 'Çok fazla giriş denemesi. Lütfen bekleyin.',
  })
  @Throttle({
    short: { limit: 3, ttl: 1000 },
    medium: { limit: 10, ttl: 60000 },
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Token yenileme',
    description: 'Refresh token kullanarak yeni access token alır.',
  })
  @ApiBody({ type: RefreshDto })
  @ApiResponse({
    status: 200,
    description: 'Yeni access token başarıyla oluşturuldu.',
  })
  @ApiResponse({
    status: 401,
    description: 'Geçersiz veya süresi dolmuş refresh token.',
  })
  @Throttle({ medium: { limit: 30, ttl: 60000 } })
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.token);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Şifre sıfırlama isteği',
    description: 'Şifre sıfırlama linki içeren e-posta gönderir.',
  })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Şifre sıfırlama e-postası gönderildi.',
  })
  @ApiResponse({ status: 404, description: 'E-posta adresi bulunamadı.' })
  @ApiResponse({
    status: 429,
    description: 'Çok fazla istek. Lütfen bekleyin.',
  })
  @Throttle({
    medium: { limit: 3, ttl: 60000 },
    long: { limit: 5, ttl: 3600000 },
  })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Şifre sıfırlama',
    description: "Sıfırlama token'ı ile yeni şifre belirler.",
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Şifre başarıyla sıfırlandı.' })
  @ApiResponse({
    status: 400,
    description: 'Geçersiz veya süresi dolmuş token.',
  })
  @Throttle({ medium: { limit: 5, ttl: 60000 } })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'E-posta doğrulama',
    description: "E-posta doğrulama token'ı ile hesabı doğrular.",
  })
  @ApiBody({ type: VerifyEmailDto })
  @ApiResponse({ status: 200, description: 'E-posta başarıyla doğrulandı.' })
  @ApiResponse({
    status: 400,
    description: 'Geçersiz veya süresi dolmuş token.',
  })
  @Throttle({ medium: { limit: 10, ttl: 60000 } })
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.token);
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Doğrulama e-postası yeniden gönder',
    description: 'E-posta doğrulama linkini yeniden gönderir.',
  })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ status: 200, description: 'Doğrulama e-postası gönderildi.' })
  @ApiResponse({ status: 404, description: 'E-posta adresi bulunamadı.' })
  resendVerification(@Body() dto: ForgotPasswordDto) {
    return this.authService.resendVerificationEmail(dto.email);
  }
}
