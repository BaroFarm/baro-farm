import React from 'react';
import './App.css';
import Header from './components/common/Header';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ShopPage from "./pages/ShopPage";
import CategoryPage from "./pages/CategoryPage";

function App() {

  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<ShopPage />} />
          <Route path="/shop/:category" element={<CategoryPage />} />
          {/* 추가 페이지들도 여기에 */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
