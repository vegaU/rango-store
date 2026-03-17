import { Body, Controller, Get, Post, Req, UnauthorizedException } from "@nestjs/common";
import type { Request } from "express";
import { AuthService } from "./auth.service";
import { Public } from "./public.decorator";
import { LoginDto } from "./dto/login.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("login")
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Get("me")
  async me(@Req() request: Request & { user?: { sub: number } }) {
    const userId = request.user?.sub;
    if (!userId) {
      throw new UnauthorizedException("Missing authenticated user");
    }

    return this.authService.getProfile(userId);
  }
}
