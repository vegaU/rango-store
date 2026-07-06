import { Module, OnModuleInit } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { Client } from "pg";

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>("DATABASE_URL");
        const sslEnabled = configService.get<string>("DB_SSL")?.toLowerCase() === "true";

        if (databaseUrl) {
          return {
            type: "postgres",
            url: databaseUrl,
            ssl: sslEnabled ? { rejectUnauthorized: false } : false,
            autoLoadEntities: true,
            synchronize: false,
          };
        }

        return {
          type: "postgres",
          host: configService.get<string>("DB_HOST", "localhost"),
          port: configService.get<number>("DB_PORT", 5432),
          username: configService.get<string>("DB_USERNAME", "postgres"),
          password: configService.get<string>("DB_PASSWORD", ""),
          database: configService.get<string>("DB_NAME", "rango_store"),
          ssl: false,
          autoLoadEntities: true,
          synchronize: false,
        };
      },
    }),
  ],
})
export class DatabaseModule implements OnModuleInit {
  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.repairTenantsTable();
    await this.bootstrapDatabase();
  }

  private async repairTenantsTable() {
    console.log("DB_HOST REAL =>", process.env.DB_HOST);
  console.log("DB_USERNAME REAL =>", process.env.DB_USERNAME);
    const databaseUrl = this.configService.get<string>("DATABASE_URL");
    const sslEnabled = this.configService.get<string>("DB_SSL")?.toLowerCase() === "true";
    const sslConfig = sslEnabled ? { rejectUnauthorized: false } : false;

    const client = databaseUrl
      ? new Client({
          connectionString: databaseUrl,
          ssl: sslConfig,
        })
      : new Client({
          host: this.configService.get<string>("DB_HOST", "localhost"),
          port: this.configService.get<number>("DB_PORT", 5432),
          user: this.configService.get<string>("DB_USERNAME", "postgres"),
          password: this.configService.get<string>("DB_PASSWORD", ""),
          database: this.configService.get<string>("DB_NAME", "rango_store"),
          ssl: sslConfig,
        });
        

    try {
      await client.connect();

      const tableCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables WHERE table_name = 'tenants'
        )
      `);

      if (!tableCheck.rows[0].exists) {
        console.log("✓ tenants table doesn't exist yet, will be created by bootstrap");
        return;
      }

      const colCheck = await client.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'tenants' AND column_name = 'name'
      `);

      if (colCheck.rows.length === 0) {
        await client.query(`ALTER TABLE tenants ADD COLUMN name VARCHAR(255)`);
        await client.query(`UPDATE tenants SET name = 'Default Store' WHERE name IS NULL`);
        await client.query(`ALTER TABLE tenants ALTER COLUMN name SET NOT NULL`);
        console.log("✓ Repaired tenants table: added 'name' column with backfill");
      } else {
        const nullCheck = await client.query(
          `SELECT COUNT(*)::int AS cnt FROM tenants WHERE name IS NULL`,
        );
        if (nullCheck.rows[0].cnt > 0) {
          await client.query(`UPDATE tenants SET name = 'Default Store' WHERE name IS NULL`);
          console.log(`✓ Fixed ${nullCheck.rows[0].cnt} tenant(s) with NULL name`);
        }
      }

      const slugCheck = await client.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'tenants' AND column_name = 'slug'
      `);

      if (slugCheck.rows.length === 0) {
        await client.query(`ALTER TABLE tenants ADD COLUMN slug VARCHAR(255)`);
        await client.query(`UPDATE tenants SET slug = 'default' WHERE slug IS NULL`);
        await client.query(`ALTER TABLE tenants ALTER COLUMN slug SET NOT NULL`);
        await client.query(
          `ALTER TABLE tenants ADD CONSTRAINT tenants_slug_unique UNIQUE (slug)`,
        );
        console.log("✓ Repaired tenants table: added 'slug' column with backfill");
      }

      const existingDefault = await client.query(
        `SELECT id FROM tenants WHERE slug = 'default'`,
      );
      if (existingDefault.rows.length === 0) {
        await client.query(`
          INSERT INTO tenants (name, slug, is_active)
          VALUES ('Default Store', 'default', true)
        `);
        console.log("✓ Created default tenant (ID: 1, slug: default)");
      } else {
        await client.query(`
          UPDATE tenants SET name = 'Default Store'
          WHERE slug = 'default' AND (name IS NULL OR name = '')
        `);
      }
    } catch (error) {
      console.error("Database repair error:", error);
      throw error;
    } finally {
      await client.end();
    }
  }

  private async bootstrapDatabase() {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS tenants (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255) NOT NULL UNIQUE,
          is_active BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);

      await queryRunner.query(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql
      `);

      try {
        await queryRunner.query(`ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key`);
      } catch {
        // Table may not exist yet, that's ok
      }

      // Ensure providers table exists
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS providers (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          "contactName" VARCHAR(255),
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(255),
          address VARCHAR(255),
          "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);

      // Ensure purchases table exists
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS purchases (
          id SERIAL PRIMARY KEY,
          supplier VARCHAR(255) NOT NULL,
          "paymentMethod" VARCHAR(255),
          total DECIMAL(10,2) NOT NULL,
          notes TEXT,
          "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);

      const tablesToMigrate = [
        "users",
        "products",
        "categories",
        "customers",
        "providers",
        "sales",
        "purchases",
        "stock_movements",
      ];

      for (const table of tablesToMigrate) {
        try {
          const columnExists = await queryRunner.query(`
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = '${table}' AND column_name = 'tenant_id'
          `);
          if (columnExists.length === 0) {
            await queryRunner.query(`
              ALTER TABLE ${table} ADD COLUMN tenant_id INTEGER NOT NULL DEFAULT 1
            `);
            console.log(`✓ Added tenant_id column to table: ${table}`);
          }
        } catch {
          // Table may not exist yet, that's ok
        }
      }

      try {
        const idxExists = await queryRunner.query(`
          SELECT indexname FROM pg_indexes 
          WHERE tablename = 'users' AND indexname = 'users_email_tenant_id_key'
        `);
        if (idxExists.length === 0) {
          await queryRunner.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS users_email_tenant_id_key 
            ON users (email, tenant_id)
          `);
          console.log("✓ Created composite unique index: users_email_tenant_id_key");
        }
      } catch {
        // Table may not exist yet, that's ok
      }

      console.log("✓ Database bootstrap completed successfully");
    } catch (error) {
      console.error("Database bootstrap error:", error);
    } finally {
      await queryRunner.release();
    }
  }
}