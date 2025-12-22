import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '@/services/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { EmptyState } from '@/components/EmptyState';
import { Card, CardContent } from '@/components/Card';
import { Button } from '@/components/Button';
import { Pagination } from '@/components/Pagination';
import { PRODUCT_CATEGORIES } from '@/constants/categories';
import { useState, useEffect } from 'react';
import type { ProductFilters } from '@/types';

export function ProductsList() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<ProductFilters>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [localFilters, setLocalFilters] = useState<ProductFilters>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Debounce filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(localFilters);
    }, 500);

    return () => clearTimeout(timer);
  }, [localFilters]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => api.getProducts(filters),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleFilterChange = (key: keyof ProductFilters, value: any) => {
    setLocalFilters({ ...localFilters, [key]: value, page: 1 });
  };

  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    setLocalFilters(newFilters);
    setFilters(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters = {
      page: 1,
      limit: 20,
      sortBy: 'createdAt' as const,
      sortOrder: 'desc' as const,
    };
    setLocalFilters(defaultFilters);
    setFilters(defaultFilters);
  };

  const hasProducts = data?.data && data.data.length > 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <div className="flex space-x-2">
          <Button variant="secondary" onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? 'Hide' : 'Show'} Filters
          </Button>
          <Link to="/products/new">
            <Button>Create Product</Button>
          </Link>
        </div>
      </div>

      {showFilters && (
        <Card className="mb-6">
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={localFilters.category || ''}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {Object.values(PRODUCT_CATEGORIES).map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Price
                </label>
                <input
                  type="number"
                  value={localFilters.minPrice || ''}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Price
                </label>
                <input
                  type="number"
                  value={localFilters.maxPrice || ''}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  value={localFilters.sortBy || 'createdAt'}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="name">Name</option>
                  <option value="price">Price</option>
                  <option value="category">Category</option>
                  <option value="createdAt">Date Created</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button variant="secondary" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage error={error} onRetry={refetch} />
      ) : hasProducts ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.data.map((product) => (
              <Card key={product.id}>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                    <span className="inline-block mt-1 px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {product.category}
                    </span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      ${product.price.toFixed(2)}
                    </p>
                    {product.description && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <Link
                      to={`/products/${product.id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      View Details
                    </Link>
                    <div className="flex space-x-2">
                      <Link to={`/products/${product.id}/edit`}>
                        <Button size="sm" variant="secondary">
                          Edit
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(product.id, product.name)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Pagination
            currentPage={data.pagination.page}
            totalPages={data.pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </>
      ) : (
        <EmptyState
          title="No products found"
          description="Try adjusting your filters or create your first product"
          actionLabel="Create Product"
          onAction={() => window.location.href = '/products/new'}
        />
      )}
    </div>
  );
}
