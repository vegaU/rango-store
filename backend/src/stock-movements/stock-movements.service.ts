import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { StockMovement } from "./stock-movement.entity";

@Injectable()
export class StockMovementsService {
  constructor(
    @InjectRepository(StockMovement)
    private movementsRepository: Repository<StockMovement>,
  ) {}

  findAll(productId?: number) {
    if (productId) {
      return this.movementsRepository.find({
        where: { productId },
        order: { createdAt: "DESC" },
      });
    }
    return this.movementsRepository.find({
      order: { createdAt: "DESC" },
      take: 500,
    });
  }

  async create(data: Partial<StockMovement>) {
    const movement = this.movementsRepository.create(data);
    return this.movementsRepository.save(movement);
  }
}