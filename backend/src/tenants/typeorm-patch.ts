import { Repository, FindOptionsWhere, ObjectLiteral } from "typeorm";
import { TenantContextService } from "./tenant-context.service";
import { TenantBaseEntity } from "./tenant-base.entity";

function isTenantEntity(entity: unknown): boolean {
  if (typeof entity !== "function") return false;
  // Walk the prototype chain to check if the entity extends TenantBaseEntity
  let proto = (entity as { prototype?: object }).prototype;
  while (proto && proto !== Object.prototype) {
    if (proto === TenantBaseEntity.prototype) return true;
    proto = Object.getPrototypeOf(proto) as object;
  }
  return false;
}

function getWhereWithTenant(
  where: FindOptionsWhere<any> | FindOptionsWhere<any>[] | undefined,
  tenantId: number,
): FindOptionsWhere<any> | FindOptionsWhere<any>[] | undefined {
  if (!where) {
    return { tenantId } as FindOptionsWhere<any>;
  }

  if (Array.isArray(where)) {
    return where.map((w) => ({
      ...w,
      tenantId,
    })) as FindOptionsWhere<any>[];
  }

  return { ...where, tenantId } as FindOptionsWhere<any>;
}

export function patchTypeOrmRepository(tenantContextService: TenantContextService) {
  const originalProto = (Repository.prototype as unknown) as Record<string, unknown>;

  const methodsToPatch = [
    "find",
    "findOne",
    "findOneBy",
    "findOneOrFail",
    "count",
    "findAndCount",
    "update",
    "delete",
  ] as const;

  for (const methodName of methodsToPatch) {
    const originalMethod = originalProto[methodName] as (...args: unknown[]) => unknown;
    if (typeof originalMethod !== "function") continue;

    originalProto[methodName] = function (this: Repository<ObjectLiteral>, ...args: unknown[]) {
      const targetEntity = this.target;
      // Skip tenant filtering for User entity - handled manually in controller
      if (targetEntity && ((typeof targetEntity === "function" && targetEntity.name === "User") || targetEntity === "User")) {
        return originalMethod.apply(this, args);
      }
      if (isTenantEntity(targetEntity)) {
        const tenantId = tenantContextService.getTenantId();
        // If tenantId is 0, the user is super_admin — skip tenant filtering entirely
        if (tenantId === 0) {
          return originalMethod.apply(this, args);
        }

        if (methodName === "find" || methodName === "findOne" || methodName === "findOneOrFail" || methodName === "count" || methodName === "findAndCount") {
          const options = args[0] as Record<string, unknown> | undefined;
          if (options && typeof options === "object") {
            // Handle both { where: ... } and direct where formats
            if ("where" in options) {
              options.where = getWhereWithTenant(options.where as FindOptionsWhere<any> | FindOptionsWhere<any>[] | undefined, tenantId);
            } else if ("relations" in options || "select" in options || "order" in options || "skip" in options || "take" in options) {
              // It's a FindManyOptions/FindOneOptions with no where yet
              options.where = { tenantId } as FindOptionsWhere<any>;
            }
          } else {
            // No options, use a simple where
            args[0] = { where: { tenantId } as FindOptionsWhere<any> };
          }
        } else if (methodName === "findOneBy") {
          const where = args[0] as FindOptionsWhere<any> | undefined;
          args[0] = getWhereWithTenant(where, tenantId);
        } else if (methodName === "update" || methodName === "delete") {
          const where = args[1] as FindOptionsWhere<any> | undefined;
          if (methodName === "delete") {
            // For delete, the criteria is in the first arg
            const criteria = args[0] as FindOptionsWhere<any> | undefined;
            if (criteria && typeof criteria === "object" && !("tenantId" in criteria)) {
              // Only auto-add tenantId if the criteria is an object (not a number/string)
              args[0] = getWhereWithTenant(criteria, tenantId);
            }
          }
          // No tenant filtering on update - handled by subscriber setting tenantId on create
        }
      }
      return originalMethod.apply(this, args);
    };
  }
}
