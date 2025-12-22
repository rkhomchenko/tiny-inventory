import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '@/services/api';
import { Card, CardHeader, CardContent } from '@/components/Card';
import { Button } from '@/components/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { useState } from 'react';
import type { AddInventoryInput } from '@/types';

export function AddProductToStore() {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<AddInventoryInput>({
    productId: '',
    quantity: 1,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: store } = useQuery({
    queryKey: ['store', storeId],
    queryFn: () => api.getStore(storeId!),
    enabled: !!storeId,
  });

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products', { limit: 100 }],
    queryFn: () => api.getProducts({ limit: 100 }),
  });

  const addMutation = useMutation({
    mutationFn: (data: AddInventoryInput) => api.addProductToStore(storeId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', storeId] });
      navigate(`/stores/${storeId}`);
    },
    onError: (error: any) => {
      if (error.errors) {
        setErrors(error.errors);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!formData.productId) {
      newErrors.productId = 'Please select a product';
    }
    if (formData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    addMutation.mutate(formData);
  };

  if (productsLoading) return <LoadingSpinner />;

  return (
    <div>
      <Link to={`/stores/${storeId}`} className="text-sm text-blue-600 hover:text-blue-700 mb-4 inline-block">
        ← Back to Store
      </Link>

      <Card className="max-w-2xl">
        <CardHeader>
          <h1 className="text-2xl font-bold">Add Product to {store?.name}</h1>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="productId" className="block text-sm font-medium text-gray-700 mb-1">
                Select Product *
              </label>
              <select
                id="productId"
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.productId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">-- Select a product --</option>
                {productsData?.data.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - ${product.price.toFixed(2)} ({product.category})
                  </option>
                ))}
              </select>
              {errors.productId && (
                <p className="mt-1 text-sm text-red-600">{errors.productId}</p>
              )}
            </div>

            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                Initial Quantity *
              </label>
              <input
                type="number"
                id="quantity"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.quantity ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="50"
                min="1"
              />
              {errors.quantity && (
                <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
              )}
            </div>

            {addMutation.error && (
              <ErrorMessage error={addMutation.error} />
            )}

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(`/stores/${storeId}`)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={addMutation.isPending}
              >
                Add to Inventory
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
