import { EntityManager, FilterQuery } from '@mikro-orm/core';
import { Store } from '../entities/Store.entity.js';
import { CreateStoreDTO, UpdateStoreDTO, StoreFilterQuery } from '../schemas/store.schema.js';
import { DatabaseService } from '../config/database.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';
import { PaginatedResponse } from '../schemas/common.schema.js';

export class StoreService {
  private em: EntityManager;

  constructor() {
    this.em = DatabaseService.getORM().em.fork();
  }

  async findAll(filters: StoreFilterQuery): Promise<PaginatedResponse<Store>> {
    const { page = 1, limit = 20, search } = filters;

    // Build filter query
    const where: FilterQuery<Store> = {};

    // Add search filter if provided (case-insensitive partial match)
    if (search) {
      where.name = { $ilike: `%${search}%` };
    }

    // Get total count
    const total = await this.em.count(Store, where);

    // Calculate offset from page
    const offset = (page - 1) * limit;

    // Get paginated results
    const data = await this.em.find(Store, where, {
      limit,
      offset,
      orderBy: { createdAt: 'DESC' }
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      }
    };
  }

  async findById(id: string): Promise<Store> {
    const store = await this.em.findOne(Store, { id }, {
      populate: ['inventory'],
    });

    if (!store) {
      throw new NotFoundError(`Store with id ${id} not found`);
    }

    return store;
  }

  async create(data: CreateStoreDTO): Promise<Store> {
    // Check if store with same name already exists
    const existing = await this.em.findOne(Store, { name: data.name });
    if (existing) {
      throw new ConflictError(`Store with name "${data.name}" already exists`);
    }

    const store = this.em.create(Store, data);
    await this.em.persistAndFlush(store);
    return store;
  }

  async update(id: string, data: UpdateStoreDTO): Promise<Store> {
    const store = await this.em.findOne(Store, { id });

    if (!store) {
      throw new NotFoundError(`Store with id ${id} not found`);
    }

    // Check name uniqueness if name is being updated
    if (data.name && data.name !== store.name) {
      const existing = await this.em.findOne(Store, { name: data.name });
      if (existing) {
        throw new ConflictError(`Store with name "${data.name}" already exists`);
      }
    }

    this.em.assign(store, data);
    await this.em.flush();
    return store;
  }

  async delete(id: string): Promise<void> {
    const store = await this.em.findOne(Store, { id });

    if (!store) {
      throw new NotFoundError(`Store with id ${id} not found`);
    }

    await this.em.removeAndFlush(store);
  }
}
