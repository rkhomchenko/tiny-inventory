import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { Card, CardHeader, CardContent } from '@/components/Card';
import { Button } from '@/components/Button';

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => api.getProduct(id!),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.deleteProduct(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      navigate('/products');
    },
  });

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${product?.name}"? This action cannot be undone.`)) {
      await deleteMutation.mutateAsync();
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!product) return <ErrorMessage error={new Error('Product not found')} />;

  return (
    <div>
      <Link to="/products" className="text-sm text-blue-600 hover:text-blue-700 mb-4 inline-block">
        ← Back to Products
      </Link>

      <Card className="max-w-2xl">
        <CardHeader className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <span className="inline-block mt-2 px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
              {product.category}
            </span>
          </div>
          <div className="flex space-x-2">
            <Link to={`/products/${id}/availability`}>
              <Button>View Availability</Button>
            </Link>
            <Link to={`/products/${id}/edit`}>
              <Button variant="secondary">Edit Product</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Price</h3>
            <p className="text-3xl font-bold text-gray-900">${product.price.toFixed(2)}</p>
          </div>

          {product.description && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
              <p className="text-gray-900">{product.description}</p>
            </div>
          )}

          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Created</h3>
            <p className="text-gray-900">
              {new Date(product.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Danger Zone</h3>
            <Button
              variant="secondary"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Product'}
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              This will permanently delete the product and remove it from all store inventories.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
