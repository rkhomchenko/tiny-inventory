import { FastifyInstance } from 'fastify';
import { Type } from '@sinclair/typebox';
import * as handlers from '../handlers/analytics.handlers.js';
import * as schemas from '../schemas/analytics.schema.js';
import { ErrorResponseSchema } from '../schemas/common.schema.js';

export async function analyticsRoutes(fastify: FastifyInstance) {
  // Get inventory statistics for a specific store
  fastify.get('/api/analytics/inventory/stats/:storeId', {
    schema: {
      description: 'Get inventory statistics for a specific store',
      tags: ['analytics'],
      params: Type.Object({
        storeId: Type.String({ format: 'uuid', description: 'Store ID' }),
      }),
      response: {
        200: schemas.StoreInventoryStatsSchema,
        404: ErrorResponseSchema,
      },
    },
  }, handlers.getStoreInventoryStatsById);
}
