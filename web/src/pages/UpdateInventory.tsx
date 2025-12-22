import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '@/services/api';
import { Card, CardHeader, CardContent } from '@/components/Card';
import { Button } from '@/components/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { useState, useEffect } from 'react';
import type { UpdateInventoryInput } from '@/types';

export function UpdateInventory() {
  const { storeId, productId } = useParams<{ storeId: string; productId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<UpdateInventoryInput>({
    quantity: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: store } = useQuery({
    queryKey: ['store', storeId],
    queryFn: () => api.getStore(storeId!),
    enabled: !!storeId,
  });

  const { data: inventoryData, isLoading } = useQuery({
    queryKey: ['inventory', storeId],
    queryFn: () => api.getStoreInventory(storeId!, { limit: 100 }),
    enabled: !!storeId,
  });

  const currentItem = inventoryData?.data.find((item) => {
    const itemProductId = item.productId || item.product?.id;
    return itemProductId === productId;
  });

  useEffect(() => {
    if (currentItem) {
      setFormData({ quantity: currentItem.quantity });
    }
  }, [currentItem]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdateInventoryInput) =>
      api.updateInventoryQuantity(storeId!, productId!, data),
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
    if (formData.quantity < 0) {
      newErrors.quantity = 'Quantity cannot be negative';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    updateMutation.mutate(formData);
  };

  if (isLoading) return <LoadingSpinner />;
  if (!currentItem) {
    return <ErrorMessage error={new Error('Inventory item not found')} />;
  }

  return (
    <div>
      <Link to={`/stores/${storeId}`} className="text-sm text-blue-600 hover:text-blue-700 mb-4 inline-block">
        ← Back to Store
      </Link>

      <Card className="max-w-2xl">
        <CardHeader>
          <h1 className="text-2xl font-bold">
            Update Inventory - {currentItem.product?.name}
          </h1>
          <p className="text-gray-600 mt-1">Store: {store?.name}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-600">Current Quantity</p>
              <p className="text-2xl font-bold text-gray-900">{currentItem.quantity}</p>
            </div>

            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                New Quantity *
              </label>
              <input
                type="number"
                id="quantity"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.quantity ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="75"
                min="0"
              />
              {errors.quantity && (
                <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
              )}
            </div>

            {updateMutation.error && (
              <ErrorMessage error={updateMutation.error} />
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
                isLoading={updateMutation.isPending}
              >
                Update Quantity
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
