import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent } from "typeorm";
import { TenantContextService } from "./tenant-context.service";
import { TenantBaseEntity } from "./tenant-base.entity";

@EventSubscriber()
export class TenantSubscriber implements EntitySubscriberInterface {
  constructor(
    dataSource: DataSource,
    private readonly tenantContextService: TenantContextService,
  ) {
    dataSource.subscribers.push(this);
  }

  beforeInsert(event: InsertEvent<TenantBaseEntity>) {
    if (event.entity && "tenantId" in event.entity) {
      const tenantId = this.tenantContextService.getTenantId();
      // Only set tenantId from context if the entity doesn't already have one explicitly set
      // Allow tenantId = 0 for super_admin (global users)
      if (event.entity.tenantId === undefined || event.entity.tenantId === null) {
        event.entity.tenantId = tenantId;
      }
    }
  }
}