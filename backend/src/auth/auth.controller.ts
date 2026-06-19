import { Body, ConflictException, Controller, Get, Post, Req, UnauthorizedException } from "@nestjs/common";
import type { Request } from "express";
import { AuthService } from "./auth.service";
import { Public } from "./public.decorator";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { TenantsService } from "../tenants/tenants.service";
import { UsersService } from "../users/users.service";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tenantsService: TenantsService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @Post("login")
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Public()
  @Post("register")
  async register(@Body() registerDto: RegisterDto) {
    // Check if tenant slug is already taken
    const existingTenant = await this.tenantsService.findBySlug(registerDto.tenantSlug);
    if (existingTenant) {
      throw new ConflictException("El slug de la tienda ya esta en uso");
    }

    // Check if email is already taken
    const existingUser = await this.usersService.findByEmail(registerDto.adminEmail);
    if (existingUser) {
      throw new ConflictException("El email ya esta en uso");
    }

    // Create tenant
    const tenant = await this.tenantsService.create(registerDto.tenantName, registerDto.tenantSlug);

    // Use the tenant context for creating the admin user
    // We call the users service directly - the TenantSubscriber will set the tenantId
    const user = await this.usersService.createUser({
      name: registerDto.adminName,
      email: registerDto.adminEmail,
      password: registerDto.adminPassword,
      role: "admin",
    });

    return {
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
      },
      message: "Tienda y administrador creados exitosamente",
    };
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
