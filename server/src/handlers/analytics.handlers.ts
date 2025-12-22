import { FastifyRequest, FastifyReply } from 'fastify';
import { AnalyticsService } from '../services/analytics.service.js';

export const getStoreInventoryStatsById = async (
  request: FastifyRequest<{ Params: { storeId: string } }>,
  reply: FastifyReply
) => {
  const service = new AnalyticsService();
  const stats = await service.getStoreInventoryStatsById(request.params.storeId);

  if (!stats) {
    return reply.status(404).send({
      error: `Store with id ${request.params.storeId} not found or has no inventory`,
      statusCode: 404,
    });
  }

  return stats;
};
