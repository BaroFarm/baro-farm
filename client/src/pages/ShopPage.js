import React from 'react';
import ShopNav from '../components/common/ShopNav';
import PromoBanner from '../components/common/PromoBanner';
//일단 상품카드 UI 확인 후 추천 리스트 만들고 거기에다 상품 카드 옮기기
import ProductCard from '../components/common/product/ProductCard';
import SeasonalProduct from '../components/common/product/SeasonalProduct';

export default function ShopPage() {

      //임시로 상품카드 UI 확인 -> 추천 리스트 만들고 이거 지우기
    const dummyProduct = {
    id: "001",
    name: "제주 감귤",
    price: 4900,
    image: "https://via.placeholder.com/200x150?text=감귤",
    rating: 4.5,
    };
    return (
        <div>
            <ShopNav />
            <PromoBanner />
            <ProductCard product={dummyProduct} />
            <SeasonalProduct />
            
            
        </div>
    );
}