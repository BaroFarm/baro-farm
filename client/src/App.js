import React from 'react';
import './App.css';
import Header from './components/common/Header';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ShopPage from "./pages/ShopPage";
import CategoryPage from "./pages/CategoryPage";
import ProductCard from './components/common/product/ProductCard';

function App() {

  //임시로 상품카드 UI 확인 -> 추천 리스트 만들고 이거 지우기
    const dummyProduct = {
    id: "001",
    name: "제주 감귤",
    price: 4900,
    image: "https://via.placeholder.com/200x150?text=감귤",
    rating: 4.5,
  };

  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<ShopPage />} />
          <Route path="/shop/:category" element={<CategoryPage />} />
          {/* 추가 페이지들도 여기에 */}
        </Routes>
              <ProductCard product={dummyProduct} />
      </div>
    </Router>
  );
}

export default App;
