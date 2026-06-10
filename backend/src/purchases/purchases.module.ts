import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Product } from "../products/product.entity";
import { Purchase } from "./purchase.entity";
import { PurchasesController } from "./purchases.controller";
import { PurchasesService } from "./purchases.service";
import { StockMovement } from "../stock-movements/stock-movement.entity";
import { StockMovementsService } from "../stock-movements/stock-movements.service";

@Module({
  imports: [TypeOrmModule.forFeature([Purchase, Product, StockMovement])],
  providers: [PurchasesService, StockMovementsService],
  controllers: [PurchasesController],
})
export class PurchasesModule {}