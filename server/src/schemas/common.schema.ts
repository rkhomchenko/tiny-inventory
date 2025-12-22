import { Type, TSchema, Static } from '@sinclair/typebox';

// Pagination Query Parameters
export const PaginationQuerySchema = Type.Object({
  page: Type.Optional(Type.Integer({ minimum: 1, default: 1, description: 'Page number' })),
  limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100, default: 20, description: 'Items per page' })),
});

// Pagination Metadata (page-based)
export const PaginationMetaSchema = Type.Object({
  page: Type.Integer({ description: 'Current page number' }),
  limit: Type.Integer({ description: 'Items per page' }),
  total: Type.Integer({ description: 'Total number of items' }),
  totalPages: Type.Integer({ description: 'Total number of pages' }),
});

// Offset Pagination Metadata
export const OffsetPaginationMetaSchema = Type.Object({
  offset: Type.Integer({ description: 'Number of items skipped' }),
  limit: Type.Integer({ description: 'Items per page' }),
  total: Type.Integer({ description: 'Total number of items' }),
  hasMore: Type.Boolean({ description: 'Whether there are more items' }),
});

// Generic Paginated Response (page-based)
export const PaginatedResponseSchema = <T extends TSchema>(itemSchema: T) =>
  Type.Object({
    data: Type.Array(itemSchema),
    pagination: PaginationMetaSchema,
  });

// Generic Offset Paginated Response
export const OffsetPaginatedResponseSchema = <T extends TSchema>(itemSchema: T) =>
  Type.Object({
    data: Type.Array(itemSchema),
    pagination: OffsetPaginationMetaSchema,
  });

// Error Response
export const ErrorResponseSchema = Type.Object({
  error: Type.String(),
  statusCode: Type.Integer(),
  details: Type.Optional(Type.Any()),
});

// Types
export type PaginationQuery = Static<typeof PaginationQuerySchema>;
export type PaginationMeta = Static<typeof PaginationMetaSchema>;
export type ErrorResponse = Static<typeof ErrorResponseSchema>;
export type PaginatedResponse<T> = {
  data: T[];
  pagination: PaginationMeta;
};

// Pagination Helper
export interface PaginationParams {
  page: number;
  limit: number;
}

export function calculatePagination(total: number, page: number, limit: number): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
  };
}
