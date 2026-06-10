import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Sale } from "./sale.entity";
import { Product } from "../products/product.entity";
import { SalesService } from "./sales.service";
import { SalesController } from "./sales.controller";
import { StockMovement } from "../stock-movements/stock-movement.entity";
import { StockMovementsService } from "../stock-movements/stock-movements.service";

@Module({
  imports: [TypeOrmModule.forFeature([Sale, Product, StockMovement])],
  providers: [SalesService, StockMovementsService],
  controllers: [SalesController],
})
export class SalesModule {}