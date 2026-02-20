import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MarketplaceHome from './pages/marketplace/Home';
import ProductListing from './pages/marketplace/ProductListing';
import ProductDetail from './pages/marketplace/ProductDetail';
import Checkout from './pages/marketplace/Checkout';
import OrderTracking from './pages/marketplace/OrderTracking';
import SellerRegistration from './pages/seller/Registration';
import SellerDashboard from './pages/seller/Dashboard';
import AddProduct from './pages/seller/AddProduct';
import ConsumerDashboard from './pages/consumer/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import AdminLogin from './pages/admin/Login';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import ConsumerLayout from './components/layout/ConsumerLayout';
import SellerLayout from './components/layout/SellerLayout';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            {/* Marketplace with Navbar/Footer - All product browsing uses ProductListing */}
            <Route path="/" element={<ProductListing />} />
            <Route path="/products" element={<ProductListing />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/track" element={<OrderTracking />} />


            {/* Consumer Dashboard with Layout */}
            <Route path="/dashboard/*" element={
              <ProtectedRoute requiredRole="CONSUMER">
                <ConsumerLayout>
                  <ConsumerDashboard />
                </ConsumerLayout>
              </ProtectedRoute>
            } />

            {/* Seller Routes */}
            <Route path="/seller/register" element={<SellerRegistration />} />
            <Route
              path="/seller/dashboard/*"
              element={
                <ProtectedRoute requiredRole="SELLER">
                  <SellerLayout>
                    <SellerDashboard />
                  </SellerLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/add-product"
              element={
                <ProtectedRoute requiredRole="SELLER">
                  <AddProduct />
                </ProtectedRoute>
              }
            />


            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
