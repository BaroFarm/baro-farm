// src/pages/MainPage.jsx
import React from 'react';
import Banner from '../components/Banner';
import ProductSection from '../components/ProductSection';

function MainPage() {
  return (
    <>
      <Banner />
      <ProductSection title="제철 상품" />
      <ProductSection title="추천 상품" />
    </>
  );
}

export default MainPage;
