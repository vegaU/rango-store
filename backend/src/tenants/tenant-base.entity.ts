import { JoinColumn, ManyToOne, Column } from "typeorm";
import { Tenant } from "./tenant.entity";

export abstract class TenantBaseEntity {
  @Column({ name: "tenant_id", default: 1 })
  tenantId!: number;

  @ManyToOne(() => Tenant, { nullable: true })
  @JoinColumn({ name: "tenant_id" })
  tenant?: Tenant;
}