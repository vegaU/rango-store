import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Sale } from "./sale.entity";
import { CreateSaleDto } from "./dto/create-sale.dto";
import { UpdateSaleDto } from "./dto/update-sale.dto";

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private salesRepository: Repository<Sale>,
  ) {}

  findAll() {
    return this.salesRepository.find();
  }

  findOne(id: number) {
    return this.salesRepository.findOneBy({ id });
  }

  create(createSaleDto: CreateSaleDto) {
    const sale = this.salesRepository.create(createSaleDto);
    return this.salesRepository.save(sale);
  }

  async update(id: number, updateSaleDto: UpdateSaleDto) {
    await this.salesRepository.update(id, updateSaleDto);
    return this.findOne(id);
  }

  remove(id: number) {
    return this.salesRepository.delete(id);
  }
}
