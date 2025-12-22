import { FastifyInstance } from 'fastify';
import { Type } from '@sinclair/typebox';
import * as handlers from '../handlers/product.handlers.js';
import * as schemas from '../schemas/product.schema.js';
import { PaginatedResponseSchema, ErrorResponseSchema } from '../schemas/common.schema.js';

export async function productRoutes(fastify: FastifyInstance) {
  fastify.get('/api/products/:id/availability', {
    schema: {
      description: 'Get product availability across all stores',
      tags: ['products'],
      params: Type.Object({
        id: Type.String({ format: 'uuid', description: 'Product ID' }),
      }),
      response: {
        200: schemas.ProductAvailabilitySchema,
        404: ErrorResponseSchema,
      },
    },
  }, handlers.getProductAvailability);

  fastify.get('/api/products', {
    schema: {
      description: 'List all products with filtering and pagination',
      tags: ['products'],
      querystring: schemas.ProductFilterQuerySchema,
      response: {
        200: PaginatedResponseSchema(schemas.ProductResponseSchema),
      },
    },
  }, handlers.getAllProducts);

  fastify.get('/api/products/:id', {
    schema: {
      description: 'Get product by ID',
      tags: ['products'],
      params: Type.Object({
        id: Type.String({ format: 'uuid', description: 'Product ID' }),
      }),
      response: {
        200: schemas.ProductResponseSchema,
        404: ErrorResponseSchema,
      },
    },
  }, handlers.getProductById);

  fastify.post('/api/products', {
    schema: {
      description: 'Create a new product',
      tags: ['products'],
      body: schemas.CreateProductSchema,
      response: {
        201: schemas.ProductResponseSchema,
        400: ErrorResponseSchema,
        401: ErrorResponseSchema,
        409: ErrorResponseSchema,
      },
    },
  }, handlers.createProduct);

  fastify.put('/api/products/:id', {
    schema: {
      description: 'Update a product',
      tags: ['products'],
      params: Type.Object({
        id: Type.String({ format: 'uuid', description: 'Product ID' }),
      }),
      body: schemas.UpdateProductSchema,
      response: {
        200: schemas.ProductResponseSchema,
        400: ErrorResponseSchema,
        401: ErrorResponseSchema,
        404: ErrorResponseSchema,
        409: ErrorResponseSchema,
      },
    },
  }, handlers.updateProduct);

  fastify.delete('/api/products/:id', {
    schema: {
      description: 'Delete a product',
      tags: ['products'],
      params: Type.Object({
        id: Type.String({ format: 'uuid', description: 'Product ID' }),
      }),
      response: {
        204: Type.Null(),
        401: ErrorResponseSchema,
        404: ErrorResponseSchema,
      },
    },
  }, handlers.deleteProduct);
}
