import { Type, Static } from '@sinclair/typebox';
import { PaginationQuerySchema } from './common.schema.js';
import { PRODUCT_CATEGORY_VALUES } from '../constants/categories.js';

// Add Product to Store Inventory
export const AddInventorySchema = Type.Object({
  productId: Type.String({ format: 'uuid', description: 'Product ID' }),
  quantity: Type.Integer({
    minimum: 0,
    description: 'Initial quantity',
  }),
});

// Update Inventory Quantity
export const UpdateInventorySchema = Type.Object({
  quantity: Type.Integer({
    minimum: 0,
    description: 'New quantity',
  }),
});

// Inventory Response (with product details)
export const InventoryResponseSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  store: Type.Object({
    id: Type.String({ format: 'uuid' }),
    name: Type.String(),
  }),
  product: Type.Object({
    id: Type.String({ format: 'uuid' }),
    name: Type.String(),
    category: Type.String(),
    price: Type.Number(),
  }),
  quantity: Type.Integer(),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
});

// Inventory Filter Query
export const InventoryFilterQuerySchema = Type.Intersect([
  PaginationQuerySchema,
  Type.Object({
    category: Type.Optional(
      Type.Union(
        PRODUCT_CATEGORY_VALUES.map(cat => Type.Literal(cat)),
        { description: 'Filter by product category (Electronics, Clothing, Food, Books, Home)' }
      )
    ),
    minStock: Type.Optional(Type.Integer({ minimum: 0, description: 'Minimum stock level' })),
    maxStock: Type.Optional(Type.Integer({ minimum: 0, description: 'Maximum stock level' })),
  }),
]);

// Type-safe DTOs
export type AddInventoryDTO = Static<typeof AddInventorySchema>;
export type UpdateInventoryDTO = Static<typeof UpdateInventorySchema>;
export type InventoryResponse = Static<typeof InventoryResponseSchema>;
export type InventoryFilterQuery = Static<typeof InventoryFilterQuerySchema>;
