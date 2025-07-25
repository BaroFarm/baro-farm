import React, {useEffect, useState} from 'react';
import { useParams } from 'react-router-dom';
import ShopNav from '../components/common/ShopNav';
import ProductSummary from '../components/productDetail/ProductSummary';
import ProductDetailNav from '../components/productDetail/ProductDetailNav';
import ProductDetailInfo from '../components/productDetail/ProductDetailInfo';
import ProductPolicy from '../components/productDetail/ProductPolicy';
import ProductReviewList from '../components/productDetail/ProductReviewList';
import ProductQnA from '../components/productDetail/ProductQnA';

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
                setProduct({
                    id: 101,
                    title: "무농약 유기농 사과",
                    price: 12000,
                    weight: "2kg",
                    status: "판매중",
                    description: "청송 농장에서 직접 수확한 신선한 유기농 사과입니다.",
                    image_url: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=600&h=400&fit=crop",
                    is_returnable: true,
                    is_subscription: true,
                    is_video: true,
                    video_url: "https://youtube.com/watch?v=abc123",
                    created_at: "2025-07-01T10:30:00",
                    updated_at: "2025-07-12T14:00:00",
                    category: {
                        id: 3,
                        name: "과일"
                    },
                    seller: {
                        id: 77,
                        name: "청송농원",
                        contact: "010-1234-5678"
                    },
                    store: {
                        id: 5,
                        name: "성수직매장"
                    },
                    detail_page: {
                        figma_export_url: "https://figma.baro.com/export/abcd1234",
                        page_status: "공개"
                    },
                    rating: 4.8,
                    review_count: 128
                });
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