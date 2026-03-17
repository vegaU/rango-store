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
  async findAll() {
    const users = await this.usersService.findAll();
    return users.map(serializeUser);
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
