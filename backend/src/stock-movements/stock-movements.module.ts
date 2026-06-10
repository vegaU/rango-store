import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StockMovement } from "./stock-movement.entity";
import { StockMovementsService } from "./stock-movements.service";
import { StockMovementsController } from "./stock-movements.controller";

@Module({
  imports: [TypeOrmModule.forFeature([StockMovement])],
  controllers: [StockMovementsController],
  providers: [StockMovementsService],
  exports: [StockMovementsService],
})
export class StockMovementsModule {}