import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { api } from '@/services/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { EmptyState } from '@/components/EmptyState';
import { Card, CardHeader, CardContent } from '@/components/Card';
import { Button } from '@/components/Button';
import { useState } from 'react';
import type { InventoryFilters } from '@/types';

export function StoreDetail() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [filters] = useState<InventoryFilters>({ page: 1, limit: 20 });

  const { data: store, isLoading: storeLoading, error: storeError } = useQuery({
    queryKey: ['store', id],
    queryFn: () => api.getStore(id!),
    enabled: !!id,
  });

  const {
    data: inventoryData,
    isLoading: inventoryLoading,
    error: inventoryError,
  } = useQuery({
    queryKey: ['inventory', id, filters],
    queryFn: () => api.getStoreInventory(id!, filters),
    enabled: !!id,
  });

  const removeProductMutation = useMutation({
    mutationFn: (productId: string) => api.removeProductFromStore(id!, productId),
    onSuccess: async () => {
      // Refetch inventory to update the view
      await queryClient.invalidateQueries({
        queryKey: ['inventory', id],
        refetchType: 'active'
      });
    },
  });

  const handleRemoveProduct = async (productId: string, productName: string) => {
    if (window.confirm(`Remove "${productName}" from inventory?`)) {
      await removeProductMutation.mutateAsync(productId);
    }
  };

  if (storeLoading) return <LoadingSpinner />;
  if (storeError) return <ErrorMessage error={storeError} />;
  if (!store) return <ErrorMessage error={new Error('Store not found')} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link to="/stores" className="text-sm text-blue-600 hover:text-blue-700 mb-2 inline-block">
            ← Back to Stores
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{store.name}</h1>
          <p className="text-gray-600 mt-1">{store.address}</p>
        </div>
        <div className="flex space-x-2">
          <Link to={`/stores/${id}/analytics`}>
            <Button variant="secondary">View Analytics</Button>
          </Link>
          <Link to={`/stores/${id}/edit`}>
            <Button variant="secondary">Edit Store</Button>
          </Link>
          <Link to={`/stores/${id}/add-product`}>
            <Button>Add Product</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Inventory</h2>
        </CardHeader>
        <CardContent>
          {inventoryLoading ? (
            <LoadingSpinner />
          ) : inventoryError ? (
            <ErrorMessage error={inventoryError} />
          ) : !inventoryData?.data || inventoryData.data.length === 0 ? (
            <EmptyState
              title="No products in inventory"
              description="Start by adding products to this store"
              actionLabel="Add Product"
              onAction={() => window.location.href = `/stores/${id}/add-product`}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inventoryData.data.map((item) => {
                    const productId = item.productId || item.product?.id;
                    return (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {item.product?.name || 'Unknown Product'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {item.product?.category || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${item.product?.price?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <Link
                            to={`/stores/${id}/inventory/${productId}/edit`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit Qty
                          </Link>
                          <button
                            onClick={() => handleRemoveProduct(productId!, item.product?.name || 'Product')}
                            className="text-red-600 hover:text-red-900"
                            disabled={!productId}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
