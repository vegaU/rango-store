import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Provider } from "./provider.entity";
import { CreateProviderDto } from "./dto/create-provider.dto";
import { UpdateProviderDto } from "./dto/update-provider.dto";
import { TenantContextService } from "../tenants/tenant-context.service";

@Injectable()
export class ProvidersService {
  constructor(
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
    private readonly tenantContextService: TenantContextService,
  ) {}

  async findAll(): Promise<Provider[]> {
    const tenantId = this.tenantContextService.getTenantId();
    if (tenantId === 0) {
      // Super admin can see all providers
      return this.providerRepository.find();
    }
    return this.providerRepository.find({ where: { tenantId } });
  }

  async findOne(id: number): Promise<Provider> {
    const tenantId = this.tenantContextService.getTenantId();
    const where: any = { id };
    if (tenantId !== 0) {
      where.tenantId = tenantId;
    }
    return this.providerRepository.findOneOrFail({ where });
  }

  async create(dto: CreateProviderDto): Promise<Provider> {
    const provider = this.providerRepository.create(dto);
    return this.providerRepository.save(provider);
  }

  async update(id: number, dto: UpdateProviderDto): Promise<Provider> {
    await this.providerRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.providerRepository.delete(id);
  }
}
