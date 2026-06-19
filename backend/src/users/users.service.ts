import { BadRequestException, ConflictException, Injectable, NotFoundException, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { hash } from "bcryptjs";
import { User, UserRole } from "./user.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { TenantContextService } from "../tenants/tenant-context.service";

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly tenantContextService: TenantContextService,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    // Run admin seed within default tenant context (tenantId = 1)
    this.tenantContextService.run({ tenantId: 1 }, async () => {
      await this.ensureAdminUser();
    });
  }

  async findByEmail(email: string) {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: number) {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findAll() {
    // By default, filter by current tenant context
    const tenantId = this.tenantContextService.getTenantId();
    if (tenantId === 0) {
      // Super Admin (tenantId = 0) can see all users
      return this.usersRepository.find({
        order: {
          createdAt: "DESC",
        },
      });
    }
    // Normal admin/cajero can only see users from their own tenant
    return this.usersRepository.find({
      where: { tenantId },
      order: {
        createdAt: "DESC",
      },
    });
  }

  async findAllForSuperAdmin() {
    // Super Admin can see all users across all tenants
    return this.usersRepository.find({
      order: {
        createdAt: "DESC",
      },
    });
  }

  async findByTenantId(tenantId: number) {
    // Use query builder to bypass typeorm-patch tenant filter override
    return this.usersRepository
      .createQueryBuilder("user")
      .where("user.tenantId = :tenantId", { tenantId })
      .orderBy("user.createdAt", "DESC")
      .getMany();
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

  private async ensureAdminUser() {
    // Create/ensure default tenant admin user
    const adminEmail = this.configService.get<string>("AUTH_ADMIN_EMAIL", "admin@rango.store").toLowerCase();
    const adminPassword = this.configService.get<string>("AUTH_ADMIN_PASSWORD", "Admin123*");
    const adminName = this.configService.get<string>("AUTH_ADMIN_NAME", "Administrador");

    const existingUser = await this.findByEmail(adminEmail);
    if (!existingUser) {
      const hashedPassword = await hash(adminPassword, 10);
      const user = this.usersRepository.create({
        name: adminName,
        email: adminEmail,
        passwordHash: hashedPassword,
        role: "admin",
        isActive: true,
        tenantId: 1,
      });
      await this.usersRepository.save(user);
      console.log("✓ Created default admin user:", adminEmail);
    }

    // Create/ensure Super Admin (global, not tied to a specific tenant)
    // Use raw SQL to completely bypass TypeORM filters and patches
    const superAdminEmail = this.configService.get<string>("SUPER_ADMIN_EMAIL", "super@rango.store").toLowerCase();
    const superAdminPassword = this.configService.get<string>("SUPER_ADMIN_PASSWORD", "SuperAdmin123*");
    const superAdminName = this.configService.get<string>("SUPER_ADMIN_NAME", "Super Administrador");

    // Use the underlying DataSource to execute raw queries
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();

      // Check if super admin exists (by email only, ignoring tenantId)
      const result = await queryRunner.query(
        `SELECT id FROM users WHERE email = $1`,
        [superAdminEmail],
      );

      if (result.length === 0) {
        const superAdminHash = await hash(superAdminPassword, 10);
        await queryRunner.query(
          `INSERT INTO users (name, email, password_hash, role, is_active, tenant_id, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, 0, NOW(), NOW())`,
          [superAdminName, superAdminEmail, superAdminHash, "super_admin", true],
        );
        console.log("✓ Created super admin user:", superAdminEmail);
      }
    } catch (error) {
      console.error("Error creating super admin:", error);
    } finally {
      await queryRunner.release();
    }
  }
}
