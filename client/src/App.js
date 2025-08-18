import './App.css';
import Layout from './components/layout/Layout';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ShopPage from "./pages/ShopPage";
import CategoryPage from "./pages/CategoryPage";
import SubscriptionPage from "./pages/SubscriptionPage";
import SubscriptionApplyPage from './pages/SubscriptionApplyPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';

import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import SignupBuyerPage from './pages/SignupBuyerPage';
import SignupSellerPage from './pages/SignupSellerPage';
import BuyerMyPage from './pages/BuyerMyPage';
import OrderListPage from './components/mypage/order/OrderListPage'
import OrderDetail from './components/mypage/order/OrderDetail';
import RefundHistoryPage from './components/mypage/refund/RefundHistoryPage';
import ProfileEdit from './components/mypage/ProfileEdit';
import RefundDetailPage from './pages/RefundDetailPage';
import PaymentPage from './pages/PaymentPage';

function App() {

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Header 안 보이게 */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/signup/buyer" element={<SignupBuyerPage />} />
          <Route path="/signup/seller" element={<SignupSellerPage />} />

          {/* 나머지 페이지는 Layout으로 감싸기 */}
          <Route element={<Layout />}>
            <Route path="/" element={<ShopPage />} />
            <Route path="/shop/:category" element={<CategoryPage />} />
            <Route path="/shop/products/subscription" element={<SubscriptionPage />} />
            <Route path="/shop/subscription/apply/:productId" element={<SubscriptionApplyPage />} />
            <Route path="/shop/product/:productId" element={<ProductDetailPage />} />
            <Route path="/mypage/buyer" element={<BuyerMyPage />} />
            <Route path="/my/orders" element={<OrderListPage />} />
            <Route path="/my/orders/:orderId" element={<OrderDetail />} />
            <Route path="my/refunds" element={<RefundHistoryPage />} />
            <Route path="/my/profile/edit" element={<ProfileEdit />} />
            <Route path="/my/cancel/:refundId" element={<RefundDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/payments" element={<PaymentPage />} />

          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
