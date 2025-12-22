import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { StoresList } from './pages/StoresList';
import { StoreDetail } from './pages/StoreDetail';
import { StoreForm } from './pages/StoreForm';
import { StoreAnalytics } from './pages/StoreAnalytics';
import { ProductsList } from './pages/ProductsList';
import { ProductDetail } from './pages/ProductDetail';
import { ProductForm } from './pages/ProductForm';
import { ProductAvailability } from './pages/ProductAvailability';
import { AddProductToStore } from './pages/AddProductToStore';
import { UpdateInventory } from './pages/UpdateInventory';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />

            {/* Stores Routes */}
            <Route path="/stores" element={<StoresList />} />
            <Route path="/stores/new" element={<StoreForm />} />
            <Route path="/stores/:id" element={<StoreDetail />} />
            <Route path="/stores/:storeId/analytics" element={<StoreAnalytics />} />
            <Route path="/stores/:id/edit" element={<StoreForm />} />

            {/* Inventory Routes */}
            <Route path="/stores/:storeId/add-product" element={<AddProductToStore />} />
            <Route path="/stores/:storeId/inventory/:productId/edit" element={<UpdateInventory />} />

            {/* Products Routes */}
            <Route path="/products" element={<ProductsList />} />
            <Route path="/products/new" element={<ProductForm />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/products/:id/availability" element={<ProductAvailability />} />
            <Route path="/products/:id/edit" element={<ProductForm />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
