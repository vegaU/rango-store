import { Controller, Get, Post, Body, Param, Put, Delete } from "@nestjs/common";
import { PurchasesService } from "./purchases.service";
import { CreatePurchaseDto } from "./dto/create-purchase.dto";
import { UpdatePurchaseDto } from "./dto/update-purchase.dto";
import { Roles } from "../auth/roles.decorator";

@Controller("purchases")
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Roles("admin")
  @Get()
  findAll() {
    return this.purchasesService.findAll();
  }

  @Roles("admin")
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.purchasesService.findOne(+id);
  }

  @Roles("admin")
  @Post()
  create(@Body() createPurchaseDto: CreatePurchaseDto) {
    return this.purchasesService.create(createPurchaseDto);
  }

  @Roles("admin")
  @Put(":id")
  update(@Param("id") id: string, @Body() updatePurchaseDto: UpdatePurchaseDto) {
    return this.purchasesService.update(+id, updatePurchaseDto);
  }

  @Roles("admin")
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.purchasesService.remove(+id);
  }
}
