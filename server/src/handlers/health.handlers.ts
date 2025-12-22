import { FastifyRequest, FastifyReply } from 'fastify';
import { DatabaseService } from '../config/database.js';

export const healthCheck = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    // Check database connection
    const orm = DatabaseService.getORM();
    await orm.em.getConnection().execute('SELECT 1');

    const uptime = process.uptime();
    const uptimeFormatted = `${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`;

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: uptimeFormatted,
      database: 'connected',
      environment: process.env.NODE_ENV || 'development',
    };
  } catch (error) {
    return reply.status(503).send({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const apiInfo = async (request: FastifyRequest, reply: FastifyReply) => {
  return {
    name: 'Tiny Inventory API',
    version: '1.0.0',
    description: 'Inventory management system for stores and products',
    documentation: '/documentation',
    endpoints: {
      health: 'GET /health',
      stores: 'GET /api/stores',
      products: 'GET /api/products',
      inventory: 'GET /api/stores/:storeId/inventory',
    },
  };
};
