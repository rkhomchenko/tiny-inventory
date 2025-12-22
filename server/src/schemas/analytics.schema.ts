import { Type, Static } from '@sinclair/typebox';

// Category Breakdown Schema
export const CategoryBreakdownSchema = Type.Object({
  category: Type.String(),
  productCount: Type.Number(),
  totalUnits: Type.Number(),
  totalValue: Type.Number(),
});

// Store Inventory Statistics Schema
export const StoreInventoryStatsSchema = Type.Object({
  storeId: Type.String({ format: 'uuid' }),
  storeName: Type.String(),
  storeAddress: Type.Union([Type.String(), Type.Null()]),
  totalProducts: Type.Number({ description: 'Number of unique products' }),
  totalUnits: Type.Number({ description: 'Total units in stock' }),
  totalValue: Type.Number({ description: 'Total inventory value' }),
  averageStockPerProduct: Type.Number({ description: 'Average stock level per product' }),
  categoryBreakdown: Type.Array(CategoryBreakdownSchema),
});

// Type-safe DTOs
export type CategoryBreakdown = Static<typeof CategoryBreakdownSchema>;
export type StoreInventoryStats = Static<typeof StoreInventoryStatsSchema>;
