import { Body, Controller, Get, Param, Post, Put, Req } from "@nestjs/common";
import type { Request } from "express";
import { Roles } from "../auth/roles.decorator";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserPasswordDto } from "./dto/update-user-password.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UsersService } from "./users.service";
import type { User } from "./user.entity";

function serializeUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

@Roles("admin")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(@Req() request: Request & { user?: { role?: string; tenantId?: number } }) {
    const userRole = request.user?.role;
    const userTenantId = request.user?.tenantId;

    // Super Admin sees all users across all tenants
    if (userRole === "super_admin") {
      const users = await this.usersService.findAllForSuperAdmin();
      return users.map(serializeUser);
    }

    // Normal admin/cajero: filter by their own tenantId from the JWT token
    if (userTenantId && userTenantId > 0) {
      const users = await this.usersService.findByTenantId(userTenantId);
      return users.map(serializeUser);
    }

    // Fallback: if no tenantId in token, return empty array
    return [];
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.createUser(createUserDto);
    return serializeUser(user);
  }

  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() request: Request & { user?: { sub?: number } },
  ) {
    const user = await this.usersService.updateUser(+id, updateUserDto, request.user?.sub);
    return serializeUser(user);
  }

  @Put(":id/password")
  async updatePassword(
    @Param("id") id: string,
    @Body() updatePasswordDto: UpdateUserPasswordDto,
    @Req() request: Request & { user?: { sub?: number } },
  ) {
    const user = await this.usersService.updatePassword(+id, updatePasswordDto.password, request.user?.sub);
    return serializeUser(user);
  }
}