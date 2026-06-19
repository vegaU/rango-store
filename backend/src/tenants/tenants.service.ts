import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { hash } from "bcryptjs";
import { Tenant } from "./tenant.entity";
import { User } from "../users/user.entity";
import { RegisterTenantDto } from "./dto/register-tenant.dto";

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantsRepository: Repository<Tenant>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll() {
    return this.tenantsRepository.find({ where: { isActive: true } });
  }

  async findById(id: number) {
    return this.tenantsRepository.findOne({ where: { id } });
  }

  async findBySlug(slug: string) {
    return this.tenantsRepository.findOne({ where: { slug } });
  }

  async create(name: string, slug: string) {
    const normalizedSlug = slug.trim().toLowerCase();
    const tenant = this.tenantsRepository.create({
      name: name.trim(),
      slug: normalizedSlug,
      isActive: true,
    });
    return this.tenantsRepository.save(tenant);
  }

  async deactivate(id: number) {
    const tenant = await this.findById(id);
    if (!tenant) {
      throw new NotFoundException("Tenant no encontrado");
    }
    tenant.isActive = false;
    return this.tenantsRepository.save(tenant);
  }

  async toggleActive(id: number, isActive: boolean) {
    const tenant = await this.findById(id);
    if (!tenant) {
      throw new NotFoundException("Tenant no encontrado");
    }
    tenant.isActive = isActive;
    return this.tenantsRepository.save(tenant);
  }

  async update(id: number, data: { name?: string; slug?: string }) {
    const tenant = await this.findById(id);
    if (!tenant) {
      throw new NotFoundException("Tenant no encontrado");
    }
    if (data.name) tenant.name = data.name.trim();
    if (data.slug) {
      const normalizedSlug = data.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
      // Check slug not taken by another tenant
      const existing = await this.tenantsRepository.findOne({ where: { slug: normalizedSlug } });
      if (existing && existing.id !== id) {
        throw new BadRequestException("El slug ya está en uso por otra empresa");
      }
      tenant.slug = normalizedSlug;
    }
    return this.tenantsRepository.save(tenant);
  }

  async isTenantActive(tenantId: number): Promise<boolean> {
    const tenant = await this.findById(tenantId);
    if (!tenant) {
      return false;
    }
    return tenant.isActive;
  }

  async getStats() {
    const allTenants = await this.tenantsRepository.find();
    const total = allTenants.length;
    const active = allTenants.filter((t) => t.isActive).length;
    const inactive = total - active;

    return {
      totalTenants: total,
      activeTenants: active,
      inactiveTenants: inactive,
    };
  }

  async resolveSlug(slug: string): Promise<number> {
    const tenant = await this.findBySlug(slug);
    if (!tenant || !tenant.isActive) {
      return 1; // Default tenant if slug not found
    }
    return tenant.id;
  }

  /**
   * Registra una nueva empresa (tenant) con su administrador en una transacción atómica.
   * Si algo falla, se hace rollback de todo.
   */
  async register(dto: RegisterTenantDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Validar que el slug no esté en uso
      const normalizedSlug = dto.slug.trim().toLowerCase();
      const existingTenant = await queryRunner.manager.findOne(Tenant, {
        where: { slug: normalizedSlug },
      });
      if (existingTenant) {
        throw new ConflictException("El slug de la empresa ya está en uso");
      }

      // 2. Validar que el email no esté en uso
      const normalizedEmail = dto.adminEmail.trim().toLowerCase();
      const existingUser = await queryRunner.manager.findOne(User, {
        where: { email: normalizedEmail },
      });
      if (existingUser) {
        throw new ConflictException("El email del administrador ya está en uso");
      }

      // 3. Crear la Empresa
      const tenant = queryRunner.manager.create(Tenant, {
        name: dto.companyName.trim(),
        slug: normalizedSlug,
        isActive: true,
      });
      const savedTenant = await queryRunner.manager.save(tenant);

      // 4. Crear el Administrador (asociado al tenant creado)
      const hashedPassword = await hash(dto.adminPassword, 10);
      const user = queryRunner.manager.create(User, {
        name: dto.adminName.trim(),
        email: normalizedEmail,
        passwordHash: hashedPassword,
        role: "admin",
        isActive: true,
        tenantId: savedTenant.id,
      });
      await queryRunner.manager.save(user);

      // 5. Confirmar transacción
      await queryRunner.commitTransaction();

      return {
        message: "Empresa y administrador registrados exitosamente",
        tenant: {
          id: savedTenant.id,
          name: savedTenant.name,
          slug: savedTenant.slug,
        },
      };
    } catch (error) {
      // Si algo falla, revertimos todos los cambios
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
