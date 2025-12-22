import { EntityManager } from '@mikro-orm/core';
import { DatabaseService } from '../config/database.js';
import { Store } from '../entities/Store.entity.js';
import { StoreInventoryStats, CategoryBreakdown } from '../schemas/analytics.schema.js';

export class AnalyticsService {
  private em: EntityManager;

  constructor() {
    this.em = DatabaseService.getORM().em.fork();
  }

  /**
   * Get inventory statistics for a specific store using PostgreSQL aggregations
   * Demonstrates complex aggregation with GROUP BY and multiple aggregate functions
   * All calculations are performed at the database level for optimal performance
   */
  async getStoreInventoryStatsById(storeId: string): Promise<StoreInventoryStats | null> {
    // Verify store exists
    const store = await this.em.findOne(Store, { id: storeId });

    if (!store) {
      return null;
    }

    // Get database connection for raw queries
    const connection = this.em.getConnection();

    // Query 1: Get overall statistics using PostgreSQL aggregations
    // Uses COUNT, SUM, AVG to calculate metrics at database level
    const statsQuery = `
      SELECT
        COUNT(DISTINCT i.product_id) as total_products,
        COALESCE(SUM(i.quantity), 0) as total_units,
        COALESCE(SUM(i.quantity * p.price), 0) as total_value,
        COALESCE(AVG(i.quantity), 0) as average_stock_per_product
      FROM inventory i
      INNER JOIN product p ON i.product_id = p.id
      WHERE i.store_id = '${storeId}'
    `;

    const statsResult = await connection.execute(statsQuery);
    const stats = statsResult[0];

    // If no inventory, return empty stats
    if (stats.total_products === 0) {
      return {
        storeId: store.id,
        storeName: store.name,
        storeAddress: store.address ?? null,
        totalProducts: 0,
        totalUnits: 0,
        totalValue: 0,
        averageStockPerProduct: 0,
        categoryBreakdown: [],
      };
    }

    // Query 2: Get category breakdown using GROUP BY
    // PostgreSQL performs grouping and aggregation efficiently with indexes
    const categoryQuery = `
      SELECT
        p.category,
        COUNT(DISTINCT p.id) as product_count,
        SUM(i.quantity) as total_units,
        SUM(i.quantity * p.price) as total_value
      FROM inventory i
      INNER JOIN product p ON i.product_id = p.id
      WHERE i.store_id = '${storeId}'
      GROUP BY p.category
      ORDER BY total_value DESC
    `;

    const categoryResult = await connection.execute(categoryQuery);

    // Map database results to TypeScript types
    const categoryBreakdown: CategoryBreakdown[] = categoryResult.map((row: any) => ({
      category: row.category,
      productCount: parseInt(row.product_count, 10),
      totalUnits: parseInt(row.total_units, 10),
      totalValue: Math.round(parseFloat(row.total_value) * 100) / 100,
    }));

    return {
      storeId: store.id,
      storeName: store.name,
      storeAddress: store.address ?? null,
      totalProducts: parseInt(stats.total_products, 10),
      totalUnits: parseInt(stats.total_units, 10),
      totalValue: Math.round(parseFloat(stats.total_value) * 100) / 100,
      averageStockPerProduct: Math.round(parseFloat(stats.average_stock_per_product) * 100) / 100,
      categoryBreakdown,
    };
  }
}
