import { Type, Static } from '@sinclair/typebox';

// Create Store Schema
export const CreateStoreSchema = Type.Object({
  name: Type.String({
    minLength: 1,
    maxLength: 255,
    pattern: '^[^<>]*$', // No angle brackets for XSS protection
    description: 'Store name',
  }),
  address: Type.Optional(Type.String({
    maxLength: 1000,
    pattern: '^[^<>]*$',
    description: 'Store address',
  })),
});

// Update Store Schema
export const UpdateStoreSchema = Type.Partial(CreateStoreSchema);

// Store Response Schema
export const StoreResponseSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  name: Type.String(),
  address: Type.Union([Type.String(), Type.Null()]),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
});

// Store with Inventory Response Schema
export const StoreWithInventorySchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  name: Type.String(),
  address: Type.Union([Type.String(), Type.Null()]),
  inventoryCount: Type.Integer({ description: 'Number of products in this store' }),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
});

// Store Filter Query Parameters (page-based pagination)
export const StoreFilterQuerySchema = Type.Object({
  page: Type.Optional(Type.Integer({ minimum: 1, default: 1, description: 'Page number' })),
  limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100, default: 20, description: 'Items per page' })),
  search: Type.Optional(Type.String({
    minLength: 1,
    maxLength: 255,
    description: 'Search stores by name (case-insensitive partial match)',
  })),
});

// Type-safe DTOs
export type CreateStoreDTO = Static<typeof CreateStoreSchema>;
export type UpdateStoreDTO = Static<typeof UpdateStoreSchema>;
export type StoreResponse = Static<typeof StoreResponseSchema>;
export type StoreWithInventory = Static<typeof StoreWithInventorySchema>;
export type StoreFilterQuery = Static<typeof StoreFilterQuerySchema>;
