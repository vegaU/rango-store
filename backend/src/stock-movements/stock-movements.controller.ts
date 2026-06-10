import { Controller, Get, Param, Query } from "@nestjs/common";
import { StockMovementsService } from "./stock-movements.service";

@Controller("stock-movements")
export class StockMovementsController {
  constructor(private readonly movementsService: StockMovementsService) {}

  @Get()
  findAll(@Query("productId") productId?: string) {
    return this.movementsService.findAll(productId ? Number(productId) : undefined);
  }
}