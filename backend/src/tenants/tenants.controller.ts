import { Body, Controller, Get, Param, Patch, Post, Put } from "@nestjs/common";
import { TenantsService } from "./tenants.service";
import { Public } from "../auth/public.decorator";
import { Roles } from "../auth/roles.decorator";
import { RegisterTenantDto } from "./dto/register-tenant.dto";

@Controller("tenants")
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  // Super Admin puede ver todos los tenants (activos e inactivos)
  @Roles("super_admin")
  @Get()
  findAll() {
    return this.tenantsService.findAll();
  }

  @Public()
  @Get(":id")
  findById(@Param("id") id: string) {
    return this.tenantsService.findById(parseInt(id, 10));
  }

  @Public()
  @Get("slug/:slug")
  findBySlug(@Param("slug") slug: string) {
    return this.tenantsService.findBySlug(slug);
  }

  @Roles("super_admin")
  @Post()
  create(@Body() body: { name: string; slug: string }) {
    return this.tenantsService.create(body.name, body.slug);
  }

  @Public()
  @Post("register")
  register(@Body() dto: RegisterTenantDto) {
    return this.tenantsService.register(dto);
  }

  @Roles("super_admin")
  @Patch(":id/status")
  toggleActive(
    @Param("id") id: string,
    @Body() body: { isActive: boolean },
  ) {
    return this.tenantsService.toggleActive(parseInt(id, 10), body.isActive);
  }

  @Roles("super_admin")
  @Put(":id")
  update(
    @Param("id") id: string,
    @Body() body: { name?: string; slug?: string },
  ) {
    return this.tenantsService.update(parseInt(id, 10), body);
  }

  @Roles("super_admin")
  @Get("stats/global")
  getStats() {
    return this.tenantsService.getStats();
  }
}
