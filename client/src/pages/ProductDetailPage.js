import React, {useEffect, useState} from 'react';
import { useParams } from 'react-router-dom';
import ShopNav from '../components/common/ShopNav';
import ProductSummary from '../components/productDetail/ProductSummary';
import ProductDetailNav from '../components/productDetail/ProductDetailNav';
import ProductDetailInfo from '../components/productDetail/ProductDetailInfo';
import ProductPolicy from '../components/productDetail/ProductPolicy';
import ProductReviewList from '../components/productDetail/ProductReviewList';
import ProductQnA from '../components/productDetail/ProductQnA';
import mockProductDetail from '../data/mockProductDetail';

export default function ProductDetail(){

    const {productId} = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('상품 설명');


    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/products/${productId}`);
                const json = await res.json();
                setProduct(json.data);
            } catch (err) {
                console.error('상품 정보를 불러오지 못했습니다. 예시 데이터를 사용합니다', err);
             // 예시 데이터 직접 주입
                setProduct(mockProductDetail);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [productId]);

    if (loading) return <p>로딩 중...</p>;
    if (!product) return <p>상품을 찾을 수 없습니다.</p>;

    return(
        <div>
            <ShopNav />
            <ProductSummary product={product} />
            <ProductDetailNav 
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
            />
                
            {/* 아래 컴포넌트만 바뀜 */}
            <div style={{ padding: '24px' }}>
                {selectedCategory === '상품 설명' && <ProductDetailInfo product={product} />}
                {selectedCategory === '상세정보' && <ProductPolicy product={product} />}
                {selectedCategory === '후기' && <ProductReviewList productId={product.id} />}
                {selectedCategory === '문의' && <ProductQnA productId={product.id} />}
            </div>
        </div>
    );
}