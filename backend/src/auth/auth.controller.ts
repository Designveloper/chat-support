import { Controller, Post, Body, UseGuards, Res, Req, UnauthorizedException } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('signup')
  async signup(@Body() signupDto: SignupDto, @Res({ passthrough: true }) response: Response) {
    const { accessToken, refreshToken } = await this.authService.signup(
      signupDto.email,
      signupDto.password
    );

    this.setRefreshTokenCookie(response, refreshToken);

    return { accessToken };
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const { accessToken, refreshToken } = await this.authService.login(
      loginDto.email,
      loginDto.password
    );

    this.setRefreshTokenCookie(response, refreshToken);

    return { accessToken };
  }

  @Post('refresh')
  async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const refreshToken = request.cookies['refresh_token'];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not provided');
    }

    const { accessToken } = await this.authService.refreshAccessToken(refreshToken);
    return { accessToken };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('refresh_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
    });

    return { success: true };
  }

  private setRefreshTokenCookie(response: Response, refreshToken: string) {
    const expiresIn = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

    response.cookie('refresh_token', refreshToken, {
      httpOnly: true, // Prevents JavaScript access
      secure: true,
      sameSite: 'strict', // Prevents CSRF
      maxAge: expiresIn,
      path: '/', // Available across the site
    });
  }
}