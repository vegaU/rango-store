import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Category } from "../categories/category.entity";
import { TenantBaseEntity } from "../tenants/tenant-base.entity";

@Entity("products")
export class Product extends TenantBaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  code?: string;

  @Column()
  name!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "decimal", precision: 10, scale: 2, name: "sale_price", nullable: true })
  salePrice: number = 0;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0, name: "purchase_cost" })
  purchaseCost: number = 0;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0, name: "last_cost" })
  lastCost: number = 0;

  @Column({ type: "int", default: 0 })
  stock: number = 0;

  @Column({ type: "int", default: 0, name: "min_stock" })
  minStock: number = 0;

  @Column({ nullable: true })
  categoryId?: number;

  @ManyToOne(() => Category, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "categoryId" })
  category?: Category;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
