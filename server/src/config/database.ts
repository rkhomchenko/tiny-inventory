import { MikroORM } from '@mikro-orm/core';
import { defineConfig, PostgreSqlDriver } from '@mikro-orm/postgresql';

import { Store } from '../entities/Store.entity.js';
import { Product } from '../entities/Product.entity.js';
import { Inventory } from '../entities/Inventory.entity.js';

const config = defineConfig({
  driver: PostgreSqlDriver,
  clientUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/tiny_inventory',
  entities: [Store, Product, Inventory],
  dbName: 'tiny_inventory',
  debug: process.env.NODE_ENV === 'development',
});

export class DatabaseService {
  private static orm: MikroORM;

  static async init(): Promise<MikroORM> {
    if (!this.orm) {
      this.orm = await MikroORM.init(config);

      // Create schema if it doesn't exist
      const generator = this.orm.getSchemaGenerator();
      await generator.ensureDatabase();
      await generator.updateSchema();
    }
    return this.orm;
  }

  static getORM(): MikroORM {
    if (!this.orm) {
      throw new Error('ORM not initialized. Call init() first.');
    }
    return this.orm;
  }

  static async close(): Promise<void> {
    if (this.orm) {
      await this.orm.close();
    }
  }
}
