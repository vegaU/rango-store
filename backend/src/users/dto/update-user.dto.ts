import type { UserRole } from "../user.entity";

export class UpdateUserDto {
  name?: string;
  email?: string;
  role?: UserRole;
  isActive?: boolean;
}
