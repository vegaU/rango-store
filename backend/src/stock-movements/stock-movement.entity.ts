import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("stock_movements")
export class StockMovement {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  productId!: number;

  @Column({ type: "varchar", length: 10 })
  type!: string; // ENTRADA, SALIDA, AJUSTE

  @Column({ type: "int" })
  quantity!: number;

  @Column({ type: "int", default: 0 })
  stockBefore!: number;

  @Column({ type: "int", default: 0 })
  stockAfter!: number;

  @Column({ type: "varchar", length: 255, nullable: true })
  reference?: string;

  @CreateDateColumn()
  createdAt!: Date;
}