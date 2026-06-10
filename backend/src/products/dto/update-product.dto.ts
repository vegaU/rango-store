export class UpdateProductDto {
  code?: string;
  name?: string;
  description?: string;
  salePrice?: number;
  purchaseCost?: number;
  lastCost?: number;
  stock?: number;
  minStock?: number;
  categoryId?: number;
}