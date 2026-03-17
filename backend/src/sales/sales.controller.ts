import { Controller, Get, Post, Body, Param, Put, Delete } from "@nestjs/common";
import { SalesService } from "./sales.service";
import { CreateSaleDto } from "./dto/create-sale.dto";
import { UpdateSaleDto } from "./dto/update-sale.dto";
import { Roles } from "../auth/roles.decorator";

@Controller("sales")
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Roles("admin", "cajero")
  @Get()
  findAll() {
    return this.salesService.findAll();
  }

  @Roles("admin", "cajero")
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.salesService.findOne(+id);
  }

  @Roles("admin", "cajero")
  @Post()
  create(@Body() createSaleDto: CreateSaleDto) {
    return this.salesService.create(createSaleDto);
  }

  @Roles("admin")
  @Put(":id")
  update(@Param("id") id: string, @Body() updateSaleDto: UpdateSaleDto) {
    return this.salesService.update(+id, updateSaleDto);
  }

  @Roles("admin")
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.salesService.remove(+id);
  }
}
