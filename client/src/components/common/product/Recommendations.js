// Recommendations.jsx
import React from "react";
import ProductSlider from "./ProductSlider";
import mockRecoProducts from "../../../data/mockRecoProducts";

// id 기준 중복 제거
function dedupeById(list) {
  const m = new Map();
  for (const it of list) {
    const id = it.product_id ?? it.id;
    if (!m.has(id)) m.set(id, it);
  }
  return Array.from(m.values());
}

export default function Recommendations() {
  // ✅ 목 데이터만 사용 (API 호출 없음)
  const products = dedupeById(mockRecoProducts).map((item) => ({
    id: item.product_id ?? item.id,
    name: item.title,
    price: item.price,
    image: item.image_url,
    rating: 0, // 별점 없으니 0으로
  }));

  return <ProductSlider products={products} title="추천 상품" />;
}
