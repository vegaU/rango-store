export class CreatePurchaseDto {
  supplier!: string;
  paymentMethod?: string;
  total!: number;
  notes?: string;
}
