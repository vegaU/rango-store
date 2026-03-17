import { Controller, Get, Post, Body, Param, Put, Delete } from "@nestjs/common";
import { CustomersService } from "./customers.service";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
import { Roles } from "../auth/roles.decorator";

@Controller("customers")
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Roles("admin", "cajero")
  @Get()
  findAll() {
    return this.customersService.findAll();
  }

  @Roles("admin", "cajero")
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.customersService.findOne(+id);
  }

  @Roles("admin", "cajero")
  @Post()
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }

  @Roles("admin", "cajero")
  @Put(":id")
  update(@Param("id") id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
    return this.customersService.update(+id, updateCustomerDto);
  }

  @Roles("admin")
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.customersService.remove(+id);
  }
}
