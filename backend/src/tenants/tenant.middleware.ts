import { ForbiddenException, Injectable, NestMiddleware } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request, Response, NextFunction } from "express";
import { TenantContextService } from "./tenant-context.service";
import { TenantsService } from "./tenants.service";

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    private readonly tenantContextService: TenantContextService,
    private readonly jwtService: JwtService,
    private readonly tenantsService: TenantsService,
  ) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    let tenantId = 1; // Default tenant
    let tenantSlug: string | undefined;
    let userRole: string | undefined;

    // 1. Try to extract tenantId and role from JWT token
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      try {
        const decoded = this.jwtService.verify(token) as Record<string, unknown>;
        if (typeof decoded.tenantId === "number") {
          tenantId = decoded.tenantId;
        }
        if (typeof decoded.role === "string") {
          userRole = decoded.role;
        }
      } catch {
        // Token invalid or expired - we'll still use default tenant
      }
    }

    // 2. If no tenantId from JWT, try headers (x-tenant-slug or x-tenant-id)
    if (tenantId === 1) {
      const headerSlug = req.headers["x-tenant-slug"] as string | undefined;
      const headerId = req.headers["x-tenant-id"] as string | undefined;

      if (headerId) {
        const parsedId = parseInt(headerId, 10);
        if (!isNaN(parsedId)) {
          tenantId = parsedId;
        }
      } else if (headerSlug) {
        tenantSlug = headerSlug;
        // We'll resolve slug to id later in the service
      }
    }

    // 3. Check if tenant is active (skip check for super_admin)
    //    super_admin has tenantId = 0 meaning no tenant restriction
    if (userRole !== "super_admin" && tenantId > 0) {
      const isActive = await this.tenantsService.isTenantActive(tenantId);
      if (!isActive) {
        throw new ForbiddenException(
          "Esta cuenta ha sido suspendida. Contacta al administrador.",
        );
      }
    }

    // Run the request within the tenant context
    this.tenantContextService.run({ tenantId, tenantSlug }, () => {
      next();
    });
  }
}