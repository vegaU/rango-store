import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, Unique } from "typeorm";
import { TenantBaseEntity } from "../tenants/tenant-base.entity";

export type UserRole = "super_admin" | "admin" | "cajero";

@Entity("users")
@Unique(["email", "tenantId"])
export class User extends TenantBaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  email!: string;

  @Column({ name: "password_hash" })
  passwordHash!: string;

  @Column({ default: "admin" })
  role!: UserRole;

  @Column({ name: "is_active", default: true })
  isActive: boolean = true;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
