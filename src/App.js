// src/App.js
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


function App() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}> {/* 중앙 정렬 */}
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

          
        </Routes>
      </Router>
    </div>
  );
}

export default App;
