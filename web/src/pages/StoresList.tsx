import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '@/services/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { EmptyState } from '@/components/EmptyState';
import { Card, CardContent } from '@/components/Card';
import { Button } from '@/components/Button';
import { Pagination } from '@/components/Pagination';
import { useState, useEffect } from 'react';
import type { StoreFilters } from '@/types';

export function StoresList() {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filters, setFilters] = useState<StoreFilters>({
    page: 1,
    limit: 12,
  });
  const [localFilters, setLocalFilters] = useState<StoreFilters>({
    page: 1,
    limit: 12,
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(localFilters);
    }, 500);

    return () => clearTimeout(timer);
  }, [localFilters]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['stores', filters],
    queryFn: () => api.getStores(filters),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteStore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      setDeletingId(null);
    },
  });

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      setDeletingId(id);
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleSearchChange = (search: string) => {
    setLocalFilters({ ...localFilters, search, page: 1 });
  };

  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    setLocalFilters(newFilters);
    setFilters(newFilters);
  };

  const clearSearch = () => {
    const defaultFilters = {
      page: 1,
      limit: 12,
    };
    setLocalFilters(defaultFilters);
    setFilters(defaultFilters);
  };

  const hasStores = data?.data && data.data.length > 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Stores</h1>
        <Link to="/stores/new">
          <Button>Create Store</Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                value={localFilters.search || ''}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search stores by name..."
              />
            </div>
            {localFilters.search && (
              <Button variant="secondary" onClick={clearSearch}>
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage error={error} onRetry={refetch} />
      ) : hasStores ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.data.map((store) => (
              <Card key={store.id}>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{store.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{store.address}</p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <Link
                      to={`/stores/${store.id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      View Details
                    </Link>
                    <div className="flex space-x-2">
                      <Link to={`/stores/${store.id}/edit`}>
                        <Button size="sm" variant="secondary">
                          Edit
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(store.id, store.name)}
                        isLoading={deletingId === store.id}
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
          title="No stores found"
          description="Try adjusting your search or create your first store"
          actionLabel="Create Store"
          onAction={() => window.location.href = '/stores/new'}
        />
      )}
    </div>
  );
}
