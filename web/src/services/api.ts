import type {
  Store,
  Product,
  InventoryItem,
  PaginatedResponse,
  CreateStoreInput,
  UpdateStoreInput,
  CreateProductInput,
  UpdateProductInput,
  AddInventoryInput,
  UpdateInventoryInput,
  StoreFilters,
  ProductFilters,
  InventoryFilters,
  ProductAvailability,
  StoreInventoryStats,
  ApiError,
} from '@/types';

const API_BASE_URL = '/api';

class ApiClient {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        message: response.statusText || 'An error occurred',
      }));
      throw error;
    }

    // Handle empty responses (e.g., 204 No Content or DELETE responses)
    const contentLength = response.headers.get('content-length');
    if (contentLength === '0' || response.status === 204) {
      return undefined as T;
    }

    // Check if there's actually content to parse
    const text = await response.text();
    if (!text || text.trim() === '') {
      return undefined as T;
    }

    return JSON.parse(text);
  }

  // Health Check
  async healthCheck(): Promise<{ status: string }> {
    return this.request('/health');
  }

  // Stores
  async getStores(filters?: StoreFilters): Promise<PaginatedResponse<Store>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const query = params.toString();
    return this.request(`/stores${query ? `?${query}` : ''}`);
  }

  async getStore(id: string): Promise<Store> {
    return this.request(`/stores/${id}`);
  }

  async createStore(data: CreateStoreInput): Promise<Store> {
    return this.request('/stores', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateStore(id: string, data: UpdateStoreInput): Promise<Store> {
    return this.request(`/stores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteStore(id: string): Promise<void> {
    return this.request(`/stores/${id}`, {
      method: 'DELETE',
    });
  }

  // Products
  async getProducts(filters?: ProductFilters): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const query = params.toString();
    return this.request(`/products${query ? `?${query}` : ''}`);
  }

  async getProduct(id: string): Promise<Product> {
    return this.request(`/products/${id}`);
  }

  async createProduct(data: CreateProductInput): Promise<Product> {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: string, data: UpdateProductInput): Promise<Product> {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: string): Promise<void> {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  async getProductAvailability(productId: string): Promise<ProductAvailability> {
    return this.request(`/products/${productId}/availability`);
  }

  // Inventory
  async getStoreInventory(
    storeId: string,
    filters?: InventoryFilters
  ): Promise<PaginatedResponse<InventoryItem>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const query = params.toString();
    return this.request(`/stores/${storeId}/inventory${query ? `?${query}` : ''}`);
  }

  async addProductToStore(
    storeId: string,
    data: AddInventoryInput
  ): Promise<InventoryItem> {
    return this.request(`/stores/${storeId}/inventory`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateInventoryQuantity(
    storeId: string,
    productId: string,
    data: UpdateInventoryInput
  ): Promise<InventoryItem> {
    return this.request(`/stores/${storeId}/inventory/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async removeProductFromStore(
    storeId: string,
    productId: string
  ): Promise<void> {
    return this.request(`/stores/${storeId}/inventory/${productId}`, {
      method: 'DELETE',
    });
  }

  // Analytics
  async getStoreInventoryStatsById(storeId: string): Promise<StoreInventoryStats> {
    return this.request(`/analytics/inventory/stats/${storeId}`);
  }
}

export const api = new ApiClient();
