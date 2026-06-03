import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("purchases")
export class Purchase {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  supplier!: string;

  @Column({ nullable: true })
  paymentMethod?: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  total!: number;

  @Column({ type: "text", nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
