import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateProductDTO, UpdateProductDTO, ProductFilterQuery } from '../schemas/product.schema.js';
import { ProductService } from '../services/product.service.js';

export const getAllProducts = async (
  request: FastifyRequest<{ Querystring: ProductFilterQuery }>,
  reply: FastifyReply
) => {
  const service = new ProductService();
  const result = await service.findAll(request.query);
  return result;
};

export const getProductById = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const service = new ProductService();
  const product = await service.findById(request.params.id);
  return product;
};

export const createProduct = async (
  request: FastifyRequest<{ Body: CreateProductDTO }>,
  reply: FastifyReply
) => {
  const service = new ProductService();
  const product = await service.create(request.body);
  return reply.status(201).send(product);
};

export const updateProduct = async (
  request: FastifyRequest<{
    Params: { id: string };
    Body: UpdateProductDTO;
  }>,
  reply: FastifyReply
) => {
  const service = new ProductService();
  const product = await service.update(request.params.id, request.body);
  return product;
};

export const deleteProduct = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const service = new ProductService();
  await service.delete(request.params.id);
  return reply.status(204).send();
};

export const getProductAvailability = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const service = new ProductService();
  const availability = await service.getAvailability(request.params.id);
  return availability;
};
