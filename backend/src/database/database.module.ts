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
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get<string>("DB_HOST"),
        port: configService.get<number>("DB_PORT"),
        username: configService.get<string>("DB_USERNAME"),
        password: configService.get<string>("DB_PASSWORD"),
        database: configService.get<string>("DB_NAME"),
        ssl: false,

        autoLoadEntities: true,
        synchronize: false, // We handle all schema sync manually in bootstrapDatabase
      }),
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

  /**
   * Repairs the tenants table before TypeORM tries to sync.
   * Uses raw pg client because TypeORM syncs before onModuleInit,
   * but we need to ensure the schema is ready.
   */
  private async repairTenantsTable() {
    const client = new Client({
      host: this.configService.get<string>("DB_HOST"),
      port: this.configService.get<number>("DB_PORT"),
      user: this.configService.get<string>("DB_USERNAME"),
      password: this.configService.get<string>("DB_PASSWORD"),
      database: this.configService.get<string>("DB_NAME"),
    });

    try {
      await client.connect();

      // Check if tenants table exists at all
      const tableCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables WHERE table_name = 'tenants'
        )
      `);

      if (!tableCheck.rows[0].exists) {
        // Table doesn't exist yet, TypeORM will create it via bootstrap
        console.log("✓ tenants table doesn't exist yet, will be created by bootstrap");
        return;
      }

      // Check if 'name' column exists
      const colCheck = await client.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'tenants' AND column_name = 'name'
      `);

      if (colCheck.rows.length === 0) {
        // Add name column as nullable first
        await client.query(`ALTER TABLE tenants ADD COLUMN name VARCHAR(255)`);
        // Update any existing rows
        await client.query(`UPDATE tenants SET name = 'Default Store' WHERE name IS NULL`);
        // Now set NOT NULL
        await client.query(`ALTER TABLE tenants ALTER COLUMN name SET NOT NULL`);
        console.log("✓ Repaired tenants table: added 'name' column with backfill");
      } else {
        // Column exists, but ensure no NULL values
        const nullCheck = await client.query(
          `SELECT COUNT(*)::int AS cnt FROM tenants WHERE name IS NULL`,
        );
        if (nullCheck.rows[0].cnt > 0) {
          await client.query(`UPDATE tenants SET name = 'Default Store' WHERE name IS NULL`);
          console.log(`✓ Fixed ${nullCheck.rows[0].cnt} tenant(s) with NULL name`);
        }
      }

      // Also ensure 'slug' column exists
      const slugCheck = await client.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'tenants' AND column_name = 'slug'
      `);

      if (slugCheck.rows.length === 0) {
        await client.query(`ALTER TABLE tenants ADD COLUMN slug VARCHAR(255)`);
        await client.query(`UPDATE tenants SET slug = 'default' WHERE slug IS NULL`);
        await client.query(`ALTER TABLE tenants ALTER COLUMN slug SET NOT NULL`);
        // Add unique constraint
        await client.query(
          `ALTER TABLE tenants ADD CONSTRAINT tenants_slug_unique UNIQUE (slug)`,
        );
        console.log("✓ Repaired tenants table: added 'slug' column with backfill");
      }

      // Ensure default tenant exists
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
        // Make sure default tenant has a name
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
      // 1. Create tenants table if it doesn't exist (should already exist from repair step)
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

      // 2. Ensure tenants has auto-updated updated_at trigger
      await queryRunner.query(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql
      `);

      // 3. Drop old unique constraint on users.email if exists
      try {
        await queryRunner.query(`ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key`);
      } catch {
        // Table may not exist yet, that's ok
      }

      // 4. Add tenant_id columns to existing tables if they don't exist
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

      // 5. Add composite unique index on users(email, tenant_id) if it doesn't exist
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