import { FastifyRequest, FastifyReply } from 'fastify';
import { AddInventoryDTO, UpdateInventoryDTO, InventoryFilterQuery } from '../schemas/inventory.schema.js';
import { InventoryService } from '../services/inventory.service.js';

export const getStoreInventory = async (
  request: FastifyRequest<{
    Params: { storeId: string };
    Querystring: InventoryFilterQuery;
  }>,
  reply: FastifyReply
) => {
  const service = new InventoryService();
  const result = await service.findByStore(request.params.storeId, request.query);
  return result;
};

export const addProductToStore = async (
  request: FastifyRequest<{
    Params: { storeId: string };
    Body: AddInventoryDTO;
  }>,
  reply: FastifyReply
) => {
  const service = new InventoryService();
  const inventory = await service.addProduct(request.params.storeId, request.body);
  return reply.status(201).send(inventory);
};

export const updateStoreInventory = async (
  request: FastifyRequest<{
    Params: { storeId: string; productId: string };
    Body: UpdateInventoryDTO;
  }>,
  reply: FastifyReply
) => {
  const service = new InventoryService();
  const inventory = await service.updateQuantity(
    request.params.storeId,
    request.params.productId,
    request.body
  );
  return inventory;
};

export const removeProductFromStore = async (
  request: FastifyRequest<{
    Params: { storeId: string; productId: string };
  }>,
  reply: FastifyReply
) => {
  const service = new InventoryService();
  await service.removeProduct(request.params.storeId, request.params.productId);
  return reply.status(204).send();
};
