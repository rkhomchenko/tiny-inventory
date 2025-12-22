import { EntityManager, FilterQuery } from '@mikro-orm/core';
import { Inventory } from '../entities/Inventory.entity.js';
import { Store } from '../entities/Store.entity.js';
import { Product } from '../entities/Product.entity.js';
import { AddInventoryDTO, UpdateInventoryDTO, InventoryFilterQuery } from '../schemas/inventory.schema.js';
import { DatabaseService } from '../config/database.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';
import { calculatePagination, PaginatedResponse } from '../schemas/common.schema.js';

export class InventoryService {
  private em: EntityManager;

  constructor() {
    this.em = DatabaseService.getORM().em.fork();
  }

  async findByStore(storeId: string, filters: InventoryFilterQuery): Promise<PaginatedResponse<Inventory>> {
    const { page = 1, limit = 20, category, minStock, maxStock } = filters;

    // Verify store exists
    const store = await this.em.findOne(Store, { id: storeId });
    if (!store) {
      throw new NotFoundError(`Store with id ${storeId} not found`);
    }

    // Build filter query
    const where: FilterQuery<Inventory> = { store: { id: storeId } };

    if (category) {
      where.product = { category };
    }

    if (minStock !== undefined || maxStock !== undefined) {
      where.quantity = {};
      if (minStock !== undefined) {
        where.quantity.$gte = minStock;
      }
      if (maxStock !== undefined) {
        where.quantity.$lte = maxStock;
      }
    }

    // Calculate offset
    const offset = (page - 1) * limit;

    // Get total count
    const total = await this.em.count(Inventory, where);

    // Get inventory with filters and pagination
    const inventory = await this.em.find(Inventory, where, {
      populate: ['store', 'product'],
      limit,
      offset,
      orderBy: { createdAt: 'DESC' },
    });

    // Calculate pagination metadata
    const pagination = calculatePagination(total, page, limit);

    return { data: inventory, pagination };
  }

  async addProduct(storeId: string, data: AddInventoryDTO): Promise<Inventory> {
    // Verify store exists
    const store = await this.em.findOne(Store, { id: storeId });
    if (!store) {
      throw new NotFoundError(`Store with id ${storeId} not found`);
    }

    // Verify product exists
    const product = await this.em.findOne(Product, { id: data.productId });
    if (!product) {
      throw new NotFoundError(`Product with id ${data.productId} not found`);
    }

    // Check if product already in store inventory
    const existing = await this.em.findOne(Inventory, {
      store: { id: storeId },
      product: { id: data.productId },
    });

    if (existing) {
      throw new ConflictError(
        `Product "${product.name}" already exists in store inventory. Use update endpoint to change quantity.`
      );
    }

    // Create inventory entry
    const inventory = this.em.create(Inventory, {
      store,
      product,
      quantity: data.quantity
    });

    await this.em.persistAndFlush(inventory);

    // Reload with relations
    await this.em.populate(inventory, ['store', 'product']);

    return inventory;
  }

  async updateQuantity(storeId: string, productId: string, data: UpdateInventoryDTO): Promise<Inventory> {
    const inventory = await this.em.findOne(
      Inventory,
      {
        store: { id: storeId },
        product: { id: productId },
      },
      { populate: ['store', 'product'] }
    );

    if (!inventory) {
      throw new NotFoundError(`Product not found in store inventory`);
    }

    inventory.quantity = data.quantity;
    await this.em.flush();

    return inventory;
  }

  async removeProduct(storeId: string, productId: string): Promise<void> {
    const inventory = await this.em.findOne(Inventory, {
      store: { id: storeId },
      product: { id: productId },
    });

    if (!inventory) {
      throw new NotFoundError(`Product not found in store inventory`);
    }

    await this.em.removeAndFlush(inventory);
  }
}
