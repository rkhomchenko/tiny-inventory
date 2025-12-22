import { useQuery } from '@tanstack/react-query';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Card, CardContent } from '@/components/Card';
import { Button } from '@/components/Button';

export function ProductAvailability() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: availability, isLoading} = useQuery({
    queryKey: ['product-availability', id],
    queryFn: () => api.getProductAvailability(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!availability) {
    return null;
  }

  return (
    <div>
      <div className="mb-6">
        <Button
          variant="secondary"
          onClick={() => navigate(`/products/${id}`)}
          className="mb-4"
        >
          ← Back to Product
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Store Availability</h1>
      </div>

      <Card className="mb-6">
        <CardContent>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{availability.productName}</h2>
              <div className="flex items-center space-x-4 mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {availability.category}
                </span>
                <span className="text-lg font-semibold text-gray-900">
                  ${availability.price.toFixed(2)}
                </span>
              </div>
              {availability.description && (
                <p className="text-gray-600 mt-3">{availability.description}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Available at {availability.stores.length} {availability.stores.length === 1 ? 'store' : 'stores'}
          </h3>
          {availability.stores.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg mb-4">This product is not available in any stores yet</p>
              <p className="text-gray-400 text-sm">Add this product to a store's inventory to see availability</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availability.stores.map((store) => (
                <div
                  key={store.storeId}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <Link
                    to={`/stores/${store.storeId}`}
                    className="text-lg font-semibold text-blue-600 hover:text-blue-800"
                  >
                    {store.storeName}
                  </Link>
                  {store.storeAddress && (
                    <p className="text-sm text-gray-600 mt-1">{store.storeAddress}</p>
                  )}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Stock:</span>
                      <span className="text-lg font-bold text-gray-900">{store.quantity}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">units available</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
