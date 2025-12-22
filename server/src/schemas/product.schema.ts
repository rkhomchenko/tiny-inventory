import { Type, Static } from '@sinclair/typebox';
import { PaginationQuerySchema } from './common.schema.js';
import { PRODUCT_CATEGORY_VALUES } from '../constants/categories.js';

// Create Product Schema
export const CreateProductSchema = Type.Object({
  name: Type.String({
    minLength: 1,
    maxLength: 255,
    pattern: '^[^<>]*$',
    description: 'Product name (must be unique)',
  }),
  category: Type.Union(
    PRODUCT_CATEGORY_VALUES.map(cat => Type.Literal(cat)),
    {
      description: 'Product category (Electronics, Clothing, Food, Books, Home)',
    }
  ),
  price: Type.Number({
    minimum: 0,
    description: 'Product price',
  }),
  description: Type.Optional(Type.String({
    maxLength: 2000,
    pattern: '^[^<>]*$',
    description: 'Product description',
  })),
});

// Update Product Schema
export const UpdateProductSchema = Type.Partial(CreateProductSchema);

// Product Response Schema
export const ProductResponseSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  name: Type.String(),
  category: Type.String(),
  price: Type.Number(),
  description: Type.Union([Type.String(), Type.Null()]),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
});

// Product Filter Query Parameters
export const ProductFilterQuerySchema = Type.Intersect([
  PaginationQuerySchema,
  Type.Object({
    category: Type.Optional(
      Type.Union(
        PRODUCT_CATEGORY_VALUES.map(cat => Type.Literal(cat)),
        { description: 'Filter by category (Electronics, Clothing, Food, Books, Home)' }
      )
    ),
    minPrice: Type.Optional(Type.Number({ minimum: 0, description: 'Minimum price' })),
    maxPrice: Type.Optional(Type.Number({ minimum: 0, description: 'Maximum price' })),
    sortBy: Type.Optional(Type.Union([
      Type.Literal('name'),
      Type.Literal('price'),
      Type.Literal('category'),
      Type.Literal('createdAt'),
    ], { default: 'createdAt', description: 'Sort field' })),
    sortOrder: Type.Optional(Type.Union([
      Type.Literal('asc'),
      Type.Literal('desc'),
    ], { default: 'desc', description: 'Sort order' })),
  }),
]);

// Product Availability Schema
export const StoreAvailabilitySchema = Type.Object({
  storeId: Type.String({ format: 'uuid' }),
  storeName: Type.String(),
  storeAddress: Type.Union([Type.String(), Type.Null()]),
  quantity: Type.Number(),
});

export const ProductAvailabilitySchema = Type.Object({
  productId: Type.String({ format: 'uuid' }),
  productName: Type.String(),
  category: Type.String(),
  price: Type.Number(),
  description: Type.Union([Type.String(), Type.Null()]),
  stores: Type.Array(StoreAvailabilitySchema),
});

// Type-safe DTOs
export type CreateProductDTO = Static<typeof CreateProductSchema>;
export type UpdateProductDTO = Static<typeof UpdateProductSchema>;
export type ProductResponse = Static<typeof ProductResponseSchema>;
export type ProductFilterQuery = Static<typeof ProductFilterQuerySchema>;
export type StoreAvailability = Static<typeof StoreAvailabilitySchema>;
export type ProductAvailability = Static<typeof ProductAvailabilitySchema>;
