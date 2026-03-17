import { Controller, Get } from "@nestjs/common";
import { DataSource } from "typeorm";
import { Public } from "../auth/public.decorator";

@Controller("health")
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Public()
  @Get()
  async getHealth() {
    const databaseRow = await this.dataSource.query(
      "select current_database() as database, current_schema() as schema",
    );

    return {
      status: "ok",
      service: "rango-store-backend",
      timestamp: new Date().toISOString(),
      database: databaseRow[0]?.database ?? null,
      schema: databaseRow[0]?.schema ?? null,
    };
  }
}
