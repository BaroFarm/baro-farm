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

//page추가 


import BuyerWishlistPage from './components/mypage/BuyerWishlistPage';
import FavoritesPage from './components/mypage/FavoritesPage';
import VoucherPage from './components/mypage/VoucherPage';
import CouponsPage from './components/mypage/CouponsPage';
import MyReviewsPage from "./components/mypage/MyReviewsPage";
import MyInquiryListPage from "./components/mypage/MyInquiryListPage";
import MyInquiryDetailPage from "./components/mypage/MyInquiryDetailPage";
import InquiryPage from "./components/mypage/InquiryPage";
import MyInquiryDetailView from "./components/mypage/MyInquiryDetailView";

import MySubscriptionListPage from "./components/mypage/MySubscriptionListPage";


//판매자 관련
import SellerLayout from './components/layout/SellerLayout';
import ProductRegisterPage from './seller/ProductRegisterPage';
import ProductFormPage from './seller/ProductFormPage';
import ProductImageUploadPage from './seller/ProductImageUploadPage';
import ProductAIDetailPage from './seller/ProductAIDetailPage';
import ProductAIDescriptionResult from './seller/ProductAIDescriptionResult';
import ProductSummaryPreview from './seller/ProductSummaryPreview';
import ProductAICustomInput from './seller/ProductAICustomInput';
import ProductVideoPreview from './seller/ProductVideoPreview';
import ProductFinalPage from './seller/ProductFinalPage';
import ProductCompletePage from './seller/ProductCompletePage';
import SellerMainPage from './seller/MainPage';
import OrderManagementPage from './seller/OrderManagementPage';
import MyStorePage from './seller/MyStorePage';

import SellerProductDetailPage from './seller/SellerProductDetailPage';


import SellerMyPage from './seller/SellerMyPage';
import MemberInfoPage from './seller/MemberInfoPage';


// App.js 맨 위 import들 아래
const dummyOrderList = [
  {
    smartDelivery: 'Y',
    orderNo: 'ORD-20250824-001',
    buyer: '김바로',
    product: '친환경 사과 5kg',
    status: '결제완료',
    date: '2025-08-24',
  },
  {
    smartDelivery: 'N',
    orderNo: 'ORD-20250824-002',
    buyer: '이팜',
    product: '바로팜 흙당근 2kg',
    status: '배송중',
    date: '2025-08-24',
  },
];


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

              <Route
                path="/my/wishlist"
                element={
                  <BuyerWishlistPage
                    items={[
                      { id: 1, name: "옹이네 양파 (1kg)", price: 9200, rating: 5, imageUrl: "/images/onion.jpg" },
                      { id: 2, name: "바로팜 당근 (1kg)", price: 4200, rating: 4, imageUrl: "/images/carrot.jpg" },
                      { id: 3, name: "달큰 고구마 (2kg)", price: 11900, rating: 4, imageUrl: "/images/sweetpotato.jpg" },
                    ]}
                  />
                }
              />  
              <Route path="/my/favorites" element={<FavoritesPage />} />  

              <Route
  path="/my/vouchers"
  element={
    <VoucherPage
      vouchers={[
        {
          id: 1,
          marketName: "옹이네 채소",
          voucherName: "옹이네 채소 금액권",
          imageUrl: "https://images.unsplash.com/photo-1524592714635-d77511a4834a?q=80&w=400&auto=format&fit=crop",
          expiresAt: "2025.05.31",
          usableAmount: 120000,
          refundableUntil: "2025.05.31",
        },
        {
          id: 2,
          marketName: "바로팜",
          voucherName: "바로팜 금액권",
          imageUrl: "/logo192.png",
          expiresAt: "2025.05.31",
          usableAmount: 45000,
          refundableUntil: "2025.05.31",
        },
      ]}
      onClickUsage={(id) => console.log("usage", id)}
      onClickRefund={(id) => console.log("refund", id)}
    />
  }
/>        <Route
  path="/my/coupons"
  element={
    <CouponsPage
      banners={[
        { id: 1, imageUrl: "https://picsum.photos/1200/400?1", alt: "봄맞이 특가" },
        { id: 2, imageUrl: "https://picsum.photos/1200/400?2", alt: "주말 할인" },
      ]}
      coupons={[
        {
          id: 101,
          discountText: "20% 할인",
          productName: "심광쌀 > 맛있는밥상",
          marketName: "맛있는밥상",
          imageUrl: "https://images.unsplash.com/photo-1604335399105-a0d7b16f2b6a?q=80&w=400&auto=format&fit=crop",
        },
        {
          id: 102,
          discountText: "10% 할인",
          productName: "주호네 농원 사과 >",
          marketName: "주호네 농원",
          imageUrl: "https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?q=80&w=400&auto=format&fit=crop",
        },
        {
          id: 103,
          discountText: "10% 할인",
          productName: "장수막걸리 >",
          marketName: "장수합시다",
          imageUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=400&auto=format&fit=crop",
        },
      ]}
      onClaim={(id) => console.log("claim coupon", id)}
    />
  }
/>

          <Route path="/mypage/reviews" element={<MyReviewsPage />} />

          <Route path="/mypage/inquiries" element={<MyInquiryListPage />} />
  <Route path="/mypage/inquiry/new" element={<div>문의 작성 페이지(추가 예정)</div>} />
          <Route path="/mypage/inquiry/:id" element={<MyInquiryDetailPage />} />
           <Route path="/mypage/inquiry" element={<InquiryPage />} />
           <Route path="/mypage/inquiryView" element={<MyInquiryDetailView />} />
            <Route path="/mypage/subscription" element={<MySubscriptionListPage />} />

          </Route>

          {/* 판매자 레이아웃(NavBar) ↓ */}
          <Route element={<SellerLayout />}>
            <Route path="/product/register" element={<ProductRegisterPage />} />
            <Route path="/product/form" element={<ProductFormPage />} />
            <Route path="/product/image-upload" element={<ProductImageUploadPage />} />
            <Route path="/seller/products/:productId/description/ai-gen" element={<ProductAIDetailPage />} />
            <Route path="/seller/products/:productId/description/result" element={<ProductAIDescriptionResult />} />
            <Route path="/product/ai-custom-input" element={<ProductAICustomInput />} />
            <Route path="/product/summary-preview" element={<ProductSummaryPreview />} />
            <Route path="/product/video-preview" element={<ProductVideoPreview />} />
            <Route path="/product/final" element={<ProductFinalPage />} />
            <Route path="/product/complete" element={<ProductCompletePage />} />
            <Route path="/seller/main" element={<SellerMainPage />} /> 
            <Route path="/order" element={<OrderManagementPage orderList={dummyOrderList} />} />


            <Route path="/shop" element={<MyStorePage />} />
            <Route path="/seller/product/:id" element={<SellerProductDetailPage />} />

            <Route path="/seller/mypage" element={<SellerMyPage />} />
        <Route path="/mypage/member-info" element={<MemberInfoPage />} />

          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
