import { Injectable } from "@nestjs/common";
import { AsyncLocalStorage } from "async_hooks";

export interface TenantContext {
  tenantId: number;
  tenantSlug?: string;
}

@Injectable()
export class TenantContextService {
  private readonly storage = new AsyncLocalStorage<TenantContext>();

  run<T>(context: TenantContext, callback: () => T): T {
    return this.storage.run(context, callback);
  }

  getTenantId(): number {
    const context = this.storage.getStore();
    if (!context) {
      return 1; // Default tenant for backwards compatibility
    }
    return context.tenantId;
  }

  getTenantSlug(): string | undefined {
    const context = this.storage.getStore();
    return context?.tenantSlug;
  }
}