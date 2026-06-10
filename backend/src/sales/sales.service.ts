import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Sale } from "./sale.entity";
import { Product } from "../products/product.entity";
import { StockMovement } from "../stock-movements/stock-movement.entity";
import { CreateSaleDto } from "./dto/create-sale.dto";
import { UpdateSaleDto } from "./dto/update-sale.dto";

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private salesRepository: Repository<Sale>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(StockMovement)
    private movementsRepository: Repository<StockMovement>,
  ) {}

  findAll() {
    return this.salesRepository.find();
  }

  findOne(id: number) {
    return this.salesRepository.findOneBy({ id });
  }

  async create(createSaleDto: CreateSaleDto) {
    // First, verify stock availability for all items
    const payload: any = this.parseNotes(createSaleDto.notes);
    if (Array.isArray(payload.items)) {
      for (const item of payload.items) {
        const productId = Number(item.productId);
        const quantity = Number(item.quantity) || 0;
        if (!productId || quantity <= 0) continue;

        const product = await this.productsRepository.findOneBy({ id: productId });
        if (!product) {
          throw new BadRequestException(`Producto ID ${productId} no encontrado`);
        }

        if (Number(product.stock) < quantity) {
          throw new BadRequestException(
            `Stock insuficiente para "${product.name}": disponible ${product.stock}, solicitado ${quantity}`
          );
        }
      }
    }

    // Save the sale
    const sale = this.salesRepository.create(createSaleDto);
    const savedSale = await this.salesRepository.save(sale);

    // Then deduct stock and register movements
    if (Array.isArray(payload.items)) {
      for (const item of payload.items) {
        const productId = Number(item.productId);
        const quantity = Number(item.quantity) || 0;
        if (!productId || quantity <= 0) continue;

        const product = await this.productsRepository.findOneBy({ id: productId });
        if (!product) continue;

        const currentStock = Number(product.stock) || 0;
        const newStock = Math.max(0, currentStock - quantity);

        product.stock = newStock;
        await this.productsRepository.save(product);

        // Register stock movement
        const movement = this.movementsRepository.create({
          productId,
          type: "SALIDA",
          quantity,
          stockBefore: currentStock,
          stockAfter: newStock,
          reference: `Venta #${savedSale.id}`,
        });
        await this.movementsRepository.save(movement);
      }
    }

    return savedSale;
  }

  async update(id: number, updateSaleDto: UpdateSaleDto) {
    await this.salesRepository.update(id, updateSaleDto);
    return this.findOne(id);
  }

  remove(id: number) {
    return this.salesRepository.delete(id);
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