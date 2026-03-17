import { BadRequestException, ConflictException, Injectable, NotFoundException, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { hash } from "bcryptjs";
import { User, UserRole } from "./user.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.ensureUsersTable();
    await this.ensureAdminUser();
  }

  async findByEmail(email: string) {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: number) {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findAll() {
    return this.usersRepository.find({
      order: {
        createdAt: "DESC",
      },
    });
  }

  async createUser(params: CreateUserDto | { name: string; email: string; password: string; role?: UserRole }) {
    const normalizedEmail = params.email.trim().toLowerCase();
    const existingUser = await this.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new ConflictException("El email ya esta en uso");
    }

    const user = this.usersRepository.create({
      name: params.name.trim(),
      email: normalizedEmail,
      passwordHash: await hash(params.password, 10),
      role: params.role ?? "admin",
      isActive: true,
    });

    return this.usersRepository.save(user);
  }

  async updateUser(id: number, params: UpdateUserDto, currentUserId?: number) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException("Usuario no encontrado");
    }

    if (params.email && params.email.trim().toLowerCase() !== user.email) {
      const existingUser = await this.findByEmail(params.email.trim().toLowerCase());
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException("El email ya esta en uso");
      }
    }

    if (typeof params.isActive === "boolean" && !params.isActive && currentUserId === user.id) {
      throw new BadRequestException("No puedes desactivar tu propio usuario");
    }

    user.name = params.name?.trim() || user.name;
    user.email = params.email?.trim().toLowerCase() || user.email;
    user.role = params.role ?? user.role;
    user.isActive = typeof params.isActive === "boolean" ? params.isActive : user.isActive;

    return this.usersRepository.save(user);
  }

  async updatePassword(id: number, password: string, currentUserId?: number) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException("Usuario no encontrado");
    }

    if (!password?.trim()) {
      throw new BadRequestException("La contrasena es obligatoria");
    }

    if (!user.isActive && currentUserId !== user.id) {
      throw new BadRequestException("No se puede actualizar la contrasena de un usuario inactivo");
    }

    user.passwordHash = await hash(password.trim(), 10);
    return this.usersRepository.save(user);
  }

  private async ensureUsersTable() {
    await this.dataSource.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'admin',
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
  }

  private async ensureAdminUser() {
    const adminEmail = this.configService.get<string>("AUTH_ADMIN_EMAIL", "admin@rango.store").toLowerCase();
    const adminPassword = this.configService.get<string>("AUTH_ADMIN_PASSWORD", "Admin123*");
    const adminName = this.configService.get<string>("AUTH_ADMIN_NAME", "Administrador");

    const existingUser = await this.findByEmail(adminEmail);
    if (existingUser) {
      return;
    }

    await this.createUser({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: "admin",
    });
  }
}
