// API Response Types
export interface Store {
  id: string;
  name: string;
  address: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  storeId: string;
  productId: string;
  quantity: number;
  product?: Product;
  createdAt: string;
  updatedAt: string;
}

// Paginated Response
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Input Types
export interface CreateStoreInput {
  name: string;
  address: string;
}

export interface UpdateStoreInput {
  name?: string;
  address?: string;
}

export interface CreateProductInput {
  name: string;
  category: string;
  price: number;
  description?: string;
}

export interface UpdateProductInput {
  name?: string;
  category?: string;
  price?: number;
  description?: string;
}

export interface AddInventoryInput {
  productId: string;
  quantity: number;
}

export interface UpdateInventoryInput {
  quantity: number;
}

// Query Parameters
export interface StoreFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'name' | 'price' | 'category' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface InventoryFilters {
  page?: number;
  limit?: number;
  category?: string;
  minStock?: number;
  maxStock?: number;
}

// Product Availability Types
export interface StoreAvailability {
  storeId: string;
  storeName: string;
  storeAddress: string | null;
  quantity: number;
}

export interface ProductAvailability {
  productId: string;
  productName: string;
  category: string;
  price: number;
  description: string | null;
  stores: StoreAvailability[];
}

// Analytics Types
export interface CategoryBreakdown {
  category: string;
  productCount: number;
  totalUnits: number;
  totalValue: number;
}

export interface StoreInventoryStats {
  storeId: string;
  storeName: string;
  storeAddress: string | null;
  totalProducts: number;
  totalUnits: number;
  totalValue: number;
  averageStockPerProduct: number;
  categoryBreakdown: CategoryBreakdown[];
}

// API Error Response
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
