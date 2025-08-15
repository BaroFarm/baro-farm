// SeasonalProduct.jsx
import React from "react";
import ProductSlider from "./ProductSlider";
import { mockSeasonalProducts } from "../../../data/mockSeasonalProducts";

// API가 준비되기 전까지는 목데이터만 표시
export default function SeasonalProduct() {
  const products = (mockSeasonalProducts || []).map(item => ({
    id: item.id,
    name: item.title,                  // UI 필드명으로 매핑
    price: item.price,
    image: item.image_url,
    rating: item.average_rating ?? 0,  // 목에 없으면 0
    isSubscription: item.is_subscription_available ?? false,
  }));

  return <ProductSlider products={products} title="제철 상품" />;
}
