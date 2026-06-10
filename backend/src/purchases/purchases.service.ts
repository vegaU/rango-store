import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Purchase } from "./purchase.entity";
import { Product } from "../products/product.entity";
import { StockMovement } from "../stock-movements/stock-movement.entity";
import { CreatePurchaseDto } from "./dto/create-purchase.dto";
import { UpdatePurchaseDto } from "./dto/update-purchase.dto";

@Injectable()
export class PurchasesService {
  constructor(
    @InjectRepository(Purchase)
    private purchasesRepository: Repository<Purchase>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(StockMovement)
    private movementsRepository: Repository<StockMovement>,
  ) {}

  findAll() {
    return this.purchasesRepository.find();
  }

  findOne(id: number) {
    return this.purchasesRepository.findOneBy({ id });
  }

  async create(createPurchaseDto: CreatePurchaseDto) {
    const purchase = this.purchasesRepository.create(createPurchaseDto);
    const savedPurchase = await this.purchasesRepository.save(purchase);

    const payload: any = this.parseNotes(createPurchaseDto.notes);
    if (Array.isArray(payload.items)) {
      for (const item of payload.items) {
        const productId = Number(item.productId);
        const quantity = Number(item.quantity) || 0;
        const cost = Number(item.cost) || 0;
        if (!productId || quantity <= 0 || cost <= 0) continue;

        const product = await this.productsRepository.findOneBy({ id: productId });
        if (!product) continue;

        const currentStock = Number(product.stock) || 0;
        const currentPurchaseCost = Number(product.purchaseCost) || 0;

        // Calculate weighted average cost
        const totalValue = currentStock * currentPurchaseCost + quantity * cost;
        const newStock = currentStock + quantity;
        const newPurchaseCost = newStock > 0 ? totalValue / newStock : cost;

        product.stock = newStock;
        product.purchaseCost = Math.round(newPurchaseCost * 100) / 100;
        product.lastCost = cost;

        await this.productsRepository.save(product);

        // Register stock movement
        const movement = this.movementsRepository.create({
          productId,
          type: "ENTRADA",
          quantity,
          stockBefore: currentStock,
          stockAfter: newStock,
          reference: `Compra #${savedPurchase.id}`,
        });
        await this.movementsRepository.save(movement);
      }
    }

    return savedPurchase;
  }

  async update(id: number, updatePurchaseDto: UpdatePurchaseDto) {
    await this.purchasesRepository.update(id, updatePurchaseDto);
    return this.findOne(id);
  }

  remove(id: number) {
    return this.purchasesRepository.delete(id);
  }

  private parseNotes(notes?: string) {
    if (!notes) return {};
    try {
      return JSON.parse(notes);
    } catch {
      return {};
    }
  }
}