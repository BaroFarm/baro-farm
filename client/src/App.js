// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import Header from './components/Header';
import NavBar from './components/NavBar';
import ErrorBoundary from './components/ErrorBoundary';

// 페이지 임포트
import MainPage from './pages/MainPage';
import ProductRegister from './pages/ProductRegisterPage';
import ProductFormPage from './pages/ProductFormPage';
import ProductImageUploadPage from './pages/ProductImageUploadPage';
import ProductAIDetailPage from './pages/ProductAIDetailPage';
import ProductAIDescriptionResult from './pages/ProductAIDescriptionResult';
import ProductAICustomInput from './pages/ProductAICustomInput';
import ProductSummaryPreview from './pages/ProductSummaryPreview';
import ProductVideoPreview from './pages/ProductVideoPreview';
import ProductFinalPage from './pages/ProductFinalPage';
import ProductCompletePage from './pages/ProductCompletePage';
import OrderManagementPage from './pages/OrderManagementPage';
import MyPage from './pages/MyPage';
import MemberInfoPage from './pages/MemberInfoPage';
import MyStorePage from './pages/MyStorePage';
import ProductDetailPage from './pages/ProductDetailPage';
import SalesPreferenceAnalytics from './pages/SalesPreferenceAnalytics';
import PreferenceOverviewPage from './pages/PreferenceOverviewPage';

// 구매자 관련
import BuyerDirectStoreChannelPage from './pages/buyer/BuyerDirectStoreChannelPage';
import BuyerTestPage from './pages/buyer/BuyerTestPage';
import BuyerVouchersPage from './pages/buyer/BuyerVouchersPage';
import CouponPage from './pages/buyer/CouponPage';
import DirectStoreInquiryPage from './pages/buyer/DirectStoreInquiryPage';

// 테스트 로그인/회원가입
import TestLoginAndRegister from './pages/TestLoginAndRegister';

// 더미 데이터
const dummyOrderList = [
  { smartDelivery: "Y", orderNo: 1023, buyer: "Bob Lee", product: "Product A", status: "접수", date: "2024-04-24" },
  { smartDelivery: "Y", orderNo: 1022, buyer: "Jane Kim", product: "Product B", status: "배송 준비중", date: "2024-04-23" },
  { smartDelivery: "N", orderNo: 1021, buyer: "John Park", product: "Product C", status: "접수", date: "2024-04-22" },
  { smartDelivery: "Y", orderNo: 1020, buyer: "Alice Na", product: "버섯", status: "배송", date: "2024-04-21" },
];

// 레이아웃 + mini 옵션
function LayoutWithOptionalChrome() {
  const { search } = useLocation();
  const mini = new URLSearchParams(search).get('mini') === '1';

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {!mini && <Header />}
      {!mini && <NavBar />}

      <Routes>
        {/* 핑 테스트 */}
        <Route path="/ping" element={<div style={{ padding: 20, fontWeight: 700 }}>PING OK</div>} />

        {/* 메인/판매자 흐름 */}
        <Route path="/" element={<MainPage />} />
        <Route path="/product/register" element={<ProductRegister />} />
        <Route path="/product/form" element={<ProductFormPage />} />
        <Route path="/product/image-upload" element={<ProductImageUploadPage />} />
        <Route path="/product/ai-description" element={<ProductAIDetailPage />} />
        <Route path="/product/ai-description-result" element={<ProductAIDescriptionResult />} />
        <Route path="/product/ai-custom-input" element={<ProductAICustomInput />} />
        <Route path="/product/summary-preview" element={<ProductSummaryPreview />} />
        <Route path="/product/video-preview" element={<ProductVideoPreview />} />
        <Route path="/product/final" element={<ProductFinalPage />} />
        <Route path="/product/complete" element={<ProductCompletePage />} />

        <Route path="/order" element={<OrderManagementPage orderList={dummyOrderList} />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/mypage/member-info" element={<MemberInfoPage />} />
        <Route path="/shop" element={<MyStorePage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/analytics" element={<SalesPreferenceAnalytics />} />
        <Route path="/analytics/preference/overview" element={<PreferenceOverviewPage />} />

        {/* 구매자 페이지 */}
        <Route path="/buyer-test" element={<BuyerTestPage />} />
        <Route path="/buyer/direct-store/chat" element={<BuyerDirectStoreChannelPage />} />
        <Route
          path="/buyer/vouchers"
          element={
            <ErrorBoundary>
              <BuyerVouchersPage />
            </ErrorBoundary>
          }
        />
        <Route path="/buyer/coupons" element={<CouponPage />} />
        <Route path="/buyer/direct-store/inquiry" element={<DirectStoreInquiryPage />} />

        {/* 스탠드얼론 */}
        <Route
          path="/__standalone/vouchers"
          element={
            <div style={{ maxWidth: 900, margin: '0 auto', padding: 20, border: '1px dashed #ddd' }}>
              <BuyerVouchersPage />
            </div>
          }
        />

        {/* 테스트 로그인/회원가입 */}
        <Route path="/test" element={<TestLoginAndRegister />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <LayoutWithOptionalChrome />
    </Router>
  );
}
