import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateStoreDTO, UpdateStoreDTO, StoreFilterQuery } from '../schemas/store.schema.js';
import { StoreService } from '../services/store.service.js';

export const getAllStores = async (
  request: FastifyRequest<{ Querystring: StoreFilterQuery }>,
  reply: FastifyReply
) => {
  const service = new StoreService();
  const result = await service.findAll(request.query);
  return result;
};

export const getStoreById = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const service = new StoreService();
  const store = await service.findById(request.params.id);
  return store;
};

export const createStore = async (
  request: FastifyRequest<{ Body: CreateStoreDTO }>,
  reply: FastifyReply
) => {
  const service = new StoreService();
  const store = await service.create(request.body);
  return reply.status(201).send(store);
};

export const updateStore = async (
  request: FastifyRequest<{
    Params: { id: string };
    Body: UpdateStoreDTO;
  }>,
  reply: FastifyReply
) => {
  const service = new StoreService();
  const store = await service.update(request.params.id, request.body);
  return store;
};

export const deleteStore = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const service = new StoreService();
  await service.delete(request.params.id);
  return reply.status(204).send();
};
