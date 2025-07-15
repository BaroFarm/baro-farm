import React from 'react';
import ShopNav from '../components/common/ShopNav';
import PromoBanner from '../components/common/PromoBanner';
//일단 상품카드 UI 확인 후 추천 리스트 만들고 거기에다 상품 카드 옮기기
import ProductCard from '../components/common/product/ProductCard';

export default function ShopPage() {
    return (
        <div>
            <ShopNav />
            <PromoBanner />
            
        </div>
    );
}