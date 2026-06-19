import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Provider } from "./provider.entity";
import { ProvidersService } from "./providers.service";
import { TenantsModule } from "../tenants/tenants.module";
import { ProvidersController } from "./providers.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Provider]), TenantsModule],
  providers: [ProvidersService],
  controllers: [ProvidersController],
  exports: [ProvidersService],
})
export class ProvidersModule {}
