import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { TenantBaseEntity } from "../tenants/tenant-base.entity";

@Entity("sales")
export class Sale extends TenantBaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  customerId!: number;

  @Column({ nullable: true })
  paymentMethod?: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  total!: number;

  @Column({ nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
