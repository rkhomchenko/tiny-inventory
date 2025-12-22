import { EntityManager, FilterQuery, QueryOrder } from '@mikro-orm/core';
import { Product } from '../entities/Product.entity.js';
import { CreateProductDTO, UpdateProductDTO, ProductFilterQuery, ProductAvailability } from '../schemas/product.schema.js';
import { DatabaseService } from '../config/database.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';
import { calculatePagination, PaginatedResponse } from '../schemas/common.schema.js';
import { Inventory } from '../entities/Inventory.entity.js';

export class ProductService {
  private em: EntityManager;

  constructor() {
    this.em = DatabaseService.getORM().em.fork();
  }

  async findAll(filters: ProductFilterQuery): Promise<PaginatedResponse<Product>> {
    const { page = 1, limit = 20, category, minPrice, maxPrice, sortBy = 'createdAt', sortOrder = 'desc' } = filters;

    // Build filter query
    const where: FilterQuery<Product> = {};

    if (category) {
      where.category = category;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        where.price.$gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.price.$lte = maxPrice;
      }
    }

    // Calculate offset
    const offset = (page - 1) * limit;

    // Get total count
    const total = await this.em.count(Product, where);

    // Get products with filters and pagination
    const products = await this.em.find(Product, where, {
      limit,
      offset,
      orderBy: { [sortBy]: sortOrder.toUpperCase() as QueryOrder },
    });

    // Calculate pagination metadata
    const pagination = calculatePagination(total, page, limit);

    return { data: products, pagination };
  }

  async findById(id: string): Promise<Product> {
    const product = await this.em.findOne(Product, { id });

    if (!product) {
      throw new NotFoundError(`Product with id ${id} not found`);
    }

    return product;
  }

  async create(data: CreateProductDTO): Promise<Product> {
    // Check if product with same name already exists
    const existing = await this.em.findOne(Product, { name: data.name });
    if (existing) {
      throw new ConflictError(`Product with name "${data.name}" already exists`);
    }

    const product = this.em.create(Product, data);
    await this.em.persistAndFlush(product);
    return product;
  }

  async update(id: string, data: UpdateProductDTO): Promise<Product> {
    const product = await this.em.findOne(Product, { id });

    if (!product) {
      throw new NotFoundError(`Product with id ${id} not found`);
    }

    // Check name uniqueness if name is being updated
    if (data.name && data.name !== product.name) {
      const existing = await this.em.findOne(Product, { name: data.name });
      if (existing) {
        throw new ConflictError(`Product with name "${data.name}" already exists`);
      }
    }

    this.em.assign(product, data);
    await this.em.flush();
    return product;
  }

  async delete(id: string): Promise<void> {
    const product = await this.em.findOne(Product, { id });

    if (!product) {
      throw new NotFoundError(`Product with id ${id} not found`);
    }

    await this.em.removeAndFlush(product);
  }

  async getAvailability(productId: string): Promise<ProductAvailability> {
    // Get the product first
    const product = await this.em.findOne(Product, { id: productId });

    if (!product) {
      throw new NotFoundError(`Product with id ${productId} not found`);
    }

    // Get all inventory entries for this product with store populated
    const inventoryItems = await this.em.find(Inventory, { product: productId }, {
      populate: ['store'],
    });

    // Map to availability data
    const availability: ProductAvailability = {
      productId: product.id,
      productName: product.name,
      category: product.category,
      price: product.price,
      description: product.description ?? null,
      stores: inventoryItems.map(item => ({
        storeId: item.store.id,
        storeName: item.store.name,
        storeAddress: item.store.address ?? null,
        quantity: item.quantity,
      })),
    };

    return availability;
  }
}
