// src/components/common/product/SeasonalProduct.jsx
import React from "react";
import ProductSlider from "./ProductSlider";
import useSeasonalProducts from "../../../hooks/useSeasonalProducts";
// (선택) 실패 시 임시 대체
import { mockSeasonalProducts } from "../../../data/mockSeasonalProducts";

export default function SeasonalProduct({ limit = 20 }) {
  const { items, loading, error } = useSeasonalProducts({ limit });

  const fallback = (mockSeasonalProducts || []).map((item) => ({
    id: item.id,
    name: item.title,
    price: item.price,
    image: item.image_url,
    rating: item.average_rating ?? 0,
    isSubscription: item.is_subscription_available ?? false,
  }));

  const products = error ? fallback : items;

  if (loading && !products?.length) {
    return <ProductSlider loading title="제철 상품" products={[]} />;
  }

  return(
    <div style={{marginTop: "20px"}}>
      <ProductSlider products={products} title="제철 상품" />
    </div>
  );
}
