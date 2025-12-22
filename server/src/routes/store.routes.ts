import { FastifyInstance } from 'fastify';
import { Type } from '@sinclair/typebox';
import * as handlers from '../handlers/store.handlers.js';
import * as schemas from '../schemas/store.schema.js';
import { PaginatedResponseSchema } from '../schemas/common.schema.js';

const ErrorSchema = Type.Object({
  error: Type.String(),
  statusCode: Type.Integer(),
});

export async function storeRoutes(fastify: FastifyInstance) {
  fastify.get('/api/stores', {
    schema: {
      description: 'List all stores with filtering and pagination',
      tags: ['stores'],
      querystring: schemas.StoreFilterQuerySchema,
      response: {
        200: PaginatedResponseSchema(schemas.StoreResponseSchema),
      },
    },
  }, handlers.getAllStores);

  fastify.get('/api/stores/:id', {
    schema: {
      description: 'Get store by ID',
      tags: ['stores'],
      params: Type.Object({
        id: Type.String({ format: 'uuid', description: 'Store ID' }),
      }),
      response: {
        200: schemas.StoreResponseSchema,
        404: ErrorSchema,
      },
    },
  }, handlers.getStoreById);

  fastify.post('/api/stores', {
    schema: {
      description: 'Create a new store',
      tags: ['stores'],
      body: schemas.CreateStoreSchema,
      response: {
        201: schemas.StoreResponseSchema,
        400: ErrorSchema,
        401: ErrorSchema,
        409: ErrorSchema,
      },
    },
  }, handlers.createStore);

  fastify.put('/api/stores/:id', {
    schema: {
      description: 'Update a store',
      tags: ['stores'],
      params: Type.Object({
        id: Type.String({ format: 'uuid', description: 'Store ID' }),
      }),
      body: schemas.UpdateStoreSchema,
      response: {
        200: schemas.StoreResponseSchema,
        400: ErrorSchema,
        401: ErrorSchema,
        404: ErrorSchema,
        409: ErrorSchema,
      },
    },
  }, handlers.updateStore);

  fastify.delete('/api/stores/:id', {
    schema: {
      description: 'Delete a store',
      tags: ['stores'],
      params: Type.Object({
        id: Type.String({ format: 'uuid', description: 'Store ID' }),
      }),
      response: {
        204: Type.Null(),
        401: ErrorSchema,
        404: ErrorSchema,
      },
    },
  }, handlers.deleteStore);
}
