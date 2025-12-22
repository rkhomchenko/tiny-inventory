import { useQuery } from '@tanstack/react-query';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { Card, CardContent, CardHeader } from '@/components/Card';
import { Button } from '@/components/Button';

export function StoreAnalytics() {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();

  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ['store-analytics', storeId],
    queryFn: () => api.getStoreInventoryStatsById(storeId!),
    enabled: !!storeId,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <ErrorMessage
        error={error}
        onRetry={refetch}
      />
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div>
      <div className="mb-6">
        <Button
          variant="secondary"
          onClick={() => navigate(`/stores/${storeId}`)}
          className="mb-4"
        >
          ← Back to Store
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Store Analytics</h1>
        <p className="text-gray-600 mt-1">{stats.storeName}</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-500 mb-1">Total Inventory Value</div>
            <div className="text-3xl font-bold text-green-600">
              ${stats.totalValue.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-500 mb-1">Unique Products</div>
            <div className="text-3xl font-bold text-blue-600">
              {stats.totalProducts}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-500 mb-1">Total Units</div>
            <div className="text-3xl font-bold text-purple-600">
              {stats.totalUnits}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-500 mb-1">Avg Stock/Product</div>
            <div className="text-3xl font-bold text-orange-600">
              {stats.averageStockPerProduct.toFixed(1)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      {stats.categoryBreakdown.length > 0 ? (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Category Breakdown</h2>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Products
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Units
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Value
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      % of Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.categoryBreakdown.map((category) => {
                    const percentOfTotal = (category.totalValue / stats.totalValue) * 100;
                    return (
                      <tr key={category.category} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            {category.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                          {category.productCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          {category.totalUnits}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right font-semibold">
                          ${category.totalValue.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${Math.min(percentOfTotal, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{percentOfTotal.toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-bold">Total</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-bold">
                      {stats.totalProducts}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-bold">
                      {stats.totalUnits}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-bold">
                      ${stats.totalValue.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-bold">
                      100%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No inventory data available</p>
              <p className="text-gray-400 text-sm mt-2">Add products to this store to see analytics</p>
              <Link to={`/stores/${storeId}/add-product`}>
                <Button className="mt-4">Add Product</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
