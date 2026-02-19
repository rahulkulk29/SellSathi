import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MarketplaceHome from './pages/marketplace/Home';
import ProductListing from './pages/marketplace/ProductListing';
import ProductDetail from './pages/marketplace/ProductDetail';
import Checkout from './pages/marketplace/Checkout';
import OrderTracking from './pages/marketplace/OrderTracking';
import SellerRegistration from './pages/seller/Registration';
import SellerDashboard from './pages/seller/Dashboard';
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
        <Routes>
          {/* Marketplace with Navbar/Footer - All product browsing uses ProductListing */}
          <Route path="/" element={<><Navbar /><main className="main-content"><ProductListing /></main><Footer /></>} />
          <Route path="/products" element={<><Navbar /><main className="main-content"><ProductListing /></main><Footer /></>} />
          <Route path="/product/:id" element={<><Navbar /><main className="main-content"><ProductDetail /></main><Footer /></>} />
          <Route path="/checkout" element={<><Navbar /><main className="main-content"><Checkout /></main><Footer /></>} />
          <Route path="/track" element={<><Navbar /><main className="main-content"><OrderTracking /></main><Footer /></>} />

          {/* Consumer Dashboard with Layout */}
          <Route path="/dashboard/*" element={
            <ProtectedRoute requiredRole="CONSUMER">
              <ConsumerLayout>
                <ConsumerDashboard />
              </ConsumerLayout>
            </ProtectedRoute>
          } />

          {/* Seller Routes */}
          <Route path="/seller/register" element={<><Navbar /><main className="main-content"><SellerRegistration /></main><Footer /></>} />
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

          {/* Admin Routes */}
          <Route path="/admin/login" element={<><Navbar /><main className="main-content"><AdminLogin /></main><Footer /></>} />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
