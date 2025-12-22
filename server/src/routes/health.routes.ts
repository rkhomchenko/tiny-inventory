import { FastifyInstance } from 'fastify';
import { Type } from '@sinclair/typebox';
import * as handlers from '../handlers/health.handlers.js';

export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get('/health', {
    schema: {
      description: 'Health check endpoint',
      tags: ['health'],
      response: {
        200: Type.Object({
          status: Type.String(),
          timestamp: Type.String(),
          uptime: Type.String(),
          database: Type.String(),
          environment: Type.String(),
        }),
        503: Type.Object({
          status: Type.String(),
          timestamp: Type.String(),
          database: Type.String(),
          error: Type.String(),
        }),
      },
    },
  }, handlers.healthCheck);
}
