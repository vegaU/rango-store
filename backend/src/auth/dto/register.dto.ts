import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class RegisterDto {
  @IsNotEmpty({ message: "El nombre de la tienda es obligatorio" })
  @IsString()
  tenantName!: string;

  @IsNotEmpty({ message: "El slug de la tienda es obligatorio" })
  @IsString()
  tenantSlug!: string;

  @IsNotEmpty({ message: "El nombre del administrador es obligatorio" })
  @IsString()
  adminName!: string;

  @IsEmail({}, { message: "El email del administrador no es válido" })
  adminEmail!: string;

  @IsNotEmpty({ message: "La contraseña es obligatoria" })
  @MinLength(6, { message: "La contraseña debe tener al menos 6 caracteres" })
  adminPassword!: string;
}