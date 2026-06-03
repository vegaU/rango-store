import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Purchase } from "./purchase.entity";
import { Product } from "../products/product.entity";
import { CreatePurchaseDto } from "./dto/create-purchase.dto";
import { UpdatePurchaseDto } from "./dto/update-purchase.dto";

@Injectable()
export class PurchasesService {
  constructor(
    @InjectRepository(Purchase)
    private purchasesRepository: Repository<Purchase>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
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
      await Promise.all(
        payload.items.map(async (item: any) => {
          const productId = Number(item.productId);
          const quantity = Number(item.quantity) || 0;
          if (!productId || quantity <= 0) {
            return;
          }

          const product = await this.productsRepository.findOneBy({ id: productId });
          if (!product) {
            return;
          }

          product.stock = (Number(product.stock) || 0) + quantity;
          await this.productsRepository.save(product);
        }),
      );
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
    if (!notes) {
      return {};
    }

    try {
      return JSON.parse(notes);
    } catch {
      return {};
    }
  }
}
