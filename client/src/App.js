import './App.css';
import Layout from './components/layout/Layout';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ShopPage from "./pages/ShopPage";
import CategoryPage from "./pages/CategoryPage";
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';

import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import SignupBuyerPage from './pages/SignupBuyerPage';
import SignupSellerPage from './pages/SignupSellerPage';

function App() {

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* 로그인 페이지: Header 안 보이게 */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/signup/buyer" element={<SignupBuyerPage />} />
          <Route path="/signup/seller" element={<SignupSellerPage />} />


          {/* 나머지 페이지는 Layout으로 감싸기 */}
          <Route element={<Layout />}>
            <Route path="/" element={<ShopPage />} />
            <Route path="/shop/:category" element={<CategoryPage />} />
            <Route path="/shop/product/:productId" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
