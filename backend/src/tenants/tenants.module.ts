import { MiddlewareConsumer, Module, NestModule, OnModuleInit } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Tenant } from "./tenant.entity";
import { TenantContextService } from "./tenant-context.service";
import { TenantsService } from "./tenants.service";
import { TenantsController } from "./tenants.controller";
import { TenantMiddleware } from "./tenant.middleware";
import { TenantSubscriber } from "./tenant.subscriber";
import { patchTypeOrmRepository } from "./typeorm-patch";

@Module({
  imports: [
    TypeOrmModule.forFeature([Tenant]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET", "rango-store-dev-secret"),
        signOptions: {
          expiresIn: configService.get<string>("JWT_EXPIRES_IN", "1d") as `${number}${"s" | "m" | "h" | "d"}`,
        },
      }),
    }),
  ],
  controllers: [TenantsController],
  providers: [TenantContextService, TenantsService, TenantSubscriber, TenantMiddleware],
  exports: [TenantContextService, TenantsService],
})
export class TenantsModule implements OnModuleInit {
  constructor(
    private readonly tenantContextService: TenantContextService,
  ) {}

  onModuleInit() {
    // Patch TypeORM Repository to automatically filter by tenantId
    patchTypeOrmRepository(this.tenantContextService);
  }
}