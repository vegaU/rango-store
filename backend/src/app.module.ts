import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { DatabaseModule } from "./database/database.module";
import { HealthModule } from "./health/health.module";
import { ProductsModule } from "./products/products.module";
import { CustomersModule } from "./customers/customers.module";
import { SalesModule } from "./sales/sales.module";
import { CategoriesModule } from "./categories/categories.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { JwtAuthGuard } from "./auth/jwt-auth.guard";
import { ProvidersModule } from "./providers/providers.module";
import { RolesGuard } from "./auth/roles.guard";
import { PurchasesModule } from "./purchases/purchases.module";
import { StockMovementsModule } from "./stock-movements/stock-movements.module";
import { TenantsModule } from "./tenants/tenants.module";
import { TenantMiddleware } from "./tenants/tenant.middleware";

@Module({
  imports: [
    ProvidersModule,
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    TenantsModule,
    UsersModule,
    AuthModule,
    HealthModule,
    ProductsModule,
    CustomersModule,
    SalesModule,
    PurchasesModule,
    CategoriesModule,
    StockMovementsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .forRoutes("*");
  }
}
