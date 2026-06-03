import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Product } from "../products/product.entity";
import { Purchase } from "./purchase.entity";
import { PurchasesController } from "./purchases.controller";
import { PurchasesService } from "./purchases.service";

@Module({
  imports: [TypeOrmModule.forFeature([Purchase, Product])],
  providers: [PurchasesService],
  controllers: [PurchasesController],
})
export class PurchasesModule {}
