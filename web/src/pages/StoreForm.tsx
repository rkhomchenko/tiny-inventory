import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '@/services/api';
import { Card, CardHeader, CardContent } from '@/components/Card';
import { Button } from '@/components/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { useState, useEffect } from 'react';
import type { CreateStoreInput } from '@/types';

export function StoreForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id && id !== 'new';

  const [formData, setFormData] = useState<CreateStoreInput>({
    name: '',
    address: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: store, isLoading } = useQuery({
    queryKey: ['store', id],
    queryFn: () => api.getStore(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (store) {
      setFormData({
        name: store.name,
        address: store.address,
      });
    }
  }, [store]);

  const createMutation = useMutation({
    mutationFn: (data: CreateStoreInput) => api.createStore(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      navigate('/stores');
    },
    onError: (error: any) => {
      if (error.errors) {
        setErrors(error.errors);
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: CreateStoreInput) => api.updateStore(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      queryClient.invalidateQueries({ queryKey: ['store', id] });
      navigate(`/stores/${id}`);
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
    if (!formData.name.trim()) {
      newErrors.name = 'Store name is required';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (isEdit) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isEdit && isLoading) return <LoadingSpinner />;

  return (
    <div>
      <Link to={isEdit ? `/stores/${id}` : '/stores'} className="text-sm text-blue-600 hover:text-blue-700 mb-4 inline-block">
        ← Back
      </Link>

      <Card className="max-w-2xl">
        <CardHeader>
          <h1 className="text-2xl font-bold">
            {isEdit ? 'Edit Store' : 'Create New Store'}
          </h1>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Store Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Downtown Store"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <input
                type="text"
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="123 Main Street, New York, NY 10001"
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address}</p>
              )}
            </div>

            {(createMutation.error || updateMutation.error) && (
              <ErrorMessage error={createMutation.error || updateMutation.error} />
            )}

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(isEdit ? `/stores/${id}` : '/stores')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={createMutation.isPending || updateMutation.isPending}
              >
                {isEdit ? 'Update Store' : 'Create Store'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
