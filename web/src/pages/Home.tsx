import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/Card';

export function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Tiny Inventory
        </h1>
        <p className="text-lg text-gray-600">
          Manage your stores, products, and inventory all in one place
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Link to="/stores" className="block transform transition-transform hover:scale-105">
          <Card className="h-full">
            <CardContent className="p-8 text-center">
              <svg
                className="mx-auto h-16 w-16 text-blue-600 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Stores</h2>
              <p className="text-gray-600">
                Manage your store locations and their inventory
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/products" className="block transform transition-transform hover:scale-105">
          <Card className="h-full">
            <CardContent className="p-8 text-center">
              <svg
                className="mx-auto h-16 w-16 text-blue-600 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Products</h2>
              <p className="text-gray-600">
                Browse and manage your product catalog with filtering
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="mt-12 text-center">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Start</h3>
            <p className="text-gray-700">
              Create stores, add products, and manage inventory quantities across all your locations
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
