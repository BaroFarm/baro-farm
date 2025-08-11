// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import NavBar from './components/NavBar';
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


const dummyOrderList = [
  { smartDelivery: "Y", orderNo: 1023, buyer: "Bob Lee", product: "Product A", status: "\uc811\uc218", date: "2024-04-24" },
  { smartDelivery: "Y", orderNo: 1022, buyer: "Jane Kim", product: "Product B", status: "\ubc30\uc1a1 \uc900\ube44\uc911", date: "2024-04-23" },
  { smartDelivery: "N", orderNo: 1021, buyer: "John Park", product: "Product C", status: "\uc811\uc218", date: "2024-04-22" },
  { smartDelivery: "Y", orderNo: 1020, buyer: "Alice Na", product: "\ube75\uc1a1", status: "\ubc30\uc1a1", date: "2024-04-21" },
];

function App() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <Router>
        <Header />
        <NavBar />
        <Routes>
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
          


        </Routes>
      </Router>
    </div>
  );
}

export default App;