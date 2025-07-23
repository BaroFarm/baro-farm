import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
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
import OrderManagementPage from './pages/OrderManagementPage';  // ✅ 추가


const dummyOrderList = [
  { smartDelivery: "Y", orderNo: 1023, buyer: "Bob Lee", product: "Product A", status: "접수", date: "2024-04-24" },
  { smartDelivery: "Y", orderNo: 1022, buyer: "Jane Kim", product: "Product B", status: "배송 준비중", date: "2024-04-23" },
  { smartDelivery: "N", orderNo: 1021, buyer: "John Park", product: "Product C", status: "접수", date: "2024-04-22" },
  { smartDelivery: "Y", orderNo: 1020, buyer: "Alice Na", product: "빵송", status: "배송", date: "2024-04-21" },
];



function App() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <Router>
        <Header />
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

        </Routes>
      </Router>
    </div>
  );
}

export default App;
