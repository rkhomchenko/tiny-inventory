import { FastifyInstance } from 'fastify';
import { Type } from '@sinclair/typebox';
import * as handlers from '../handlers/inventory.handlers.js';
import * as schemas from '../schemas/inventory.schema.js';
import { PaginatedResponseSchema, ErrorResponseSchema } from '../schemas/common.schema.js';

export async function inventoryRoutes(fastify: FastifyInstance) {
  fastify.get('/api/stores/:storeId/inventory', {
    schema: {
      description: 'Get inventory for a specific store with filtering and pagination',
      tags: ['inventory'],
      params: Type.Object({
        storeId: Type.String({ format: 'uuid', description: 'Store ID' }),
      }),
      querystring: schemas.InventoryFilterQuerySchema,
      response: {
        200: PaginatedResponseSchema(schemas.InventoryResponseSchema),
        404: ErrorResponseSchema,
      },
    },
  }, handlers.getStoreInventory);

  fastify.post('/api/stores/:storeId/inventory', {
    schema: {
      description: 'Add a product to store inventory',
      tags: ['inventory'],
      params: Type.Object({
        storeId: Type.String({ format: 'uuid', description: 'Store ID' }),
      }),
      body: schemas.AddInventorySchema,
      response: {
        201: schemas.InventoryResponseSchema,
        401: ErrorResponseSchema,
        404: ErrorResponseSchema,
        409: ErrorResponseSchema,
      },
    },
  }, handlers.addProductToStore);

  fastify.put('/api/stores/:storeId/inventory/:productId', {
    schema: {
      description: 'Update product quantity in store inventory',
      tags: ['inventory'],
      params: Type.Object({
        storeId: Type.String({ format: 'uuid', description: 'Store ID' }),
        productId: Type.String({ format: 'uuid', description: 'Product ID' }),
      }),
      body: schemas.UpdateInventorySchema,
      response: {
        200: schemas.InventoryResponseSchema,
        401: ErrorResponseSchema,
        404: ErrorResponseSchema,
      },
    },
  }, handlers.updateStoreInventory);

  fastify.delete('/api/stores/:storeId/inventory/:productId', {
    schema: {
      description: 'Remove a product from store inventory',
      tags: ['inventory'],
      params: Type.Object({
        storeId: Type.String({ format: 'uuid', description: 'Store ID' }),
        productId: Type.String({ format: 'uuid', description: 'Product ID' }),
      }),
      response: {
        204: Type.Null(),
        401: ErrorResponseSchema,
        404: ErrorResponseSchema,
      },
    },
  }, handlers.removeProductFromStore);
}
