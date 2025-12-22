import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import { AppError } from './utils/errors.js';
import { DatabaseService } from './config/database.js';
import { logger } from './utils/logger.js';
import { isDevelopment } from './config/env.js';

export async function buildApp() {
  const app = Fastify({
    logger,
    disableRequestLogging: !isDevelopment,
  });

  // Initialize database
  await DatabaseService.init();

  // Register CORS plugin
  await app.register(cors, {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
  });

  // Custom JSON parser to handle empty bodies
  app.removeContentTypeParser('application/json');
  app.addContentTypeParser('application/json', { parseAs: 'string' }, function (req, body, done) {
    // Handle empty body
    if (body === '' || body === undefined || body === null) {
      done(null, {});
      return;
    }

    try {
      const json = JSON.parse(body as string);
      done(null, json);
    } catch (err: any) {
      err.statusCode = 400;
      done(err, undefined);
    }
  });

  app.addHook('onResponse', async (request, reply) => {
    const route = request.url;
    console.log(`CODE ${reply.statusCode} - ${route}`);
  });

  // Import routes dynamically
  const { healthRoutes } = await import('./routes/health.routes.js');
  const { storeRoutes } = await import('./routes/store.routes.js');
  const { productRoutes } = await import('./routes/product.routes.js');
  const { inventoryRoutes } = await import('./routes/inventory.routes.js');
  const { analyticsRoutes } = await import('./routes/analytics.routes.js');

  // Register routes
  await app.register(healthRoutes);
  await app.register(storeRoutes);
  await app.register(productRoutes);
  await app.register(inventoryRoutes);
  await app.register(analyticsRoutes);

  // Global error handler
  app.setErrorHandler((error: Error | AppError, request: FastifyRequest, reply: FastifyReply) => {
    // request.log.error(error);
    console.error(error);

    const statusCode = 'statusCode' in error ? error.statusCode : 500;
    const message = error.message || 'Internal server error';

    reply.status(statusCode).send({
      error: message,
      statusCode
    });
  });

  // 404 handler
  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      error: 'Route not found',
      statusCode: 404,
      path: request.url,
    });
  });

  return app;
}

export type App = Awaited<ReturnType<typeof buildApp>>;
