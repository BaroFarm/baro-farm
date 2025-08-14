import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useLocation, useSearchParams } from 'react-router-dom';
import ShopNav from '../components/common/ShopNav';
import ProductSummary from '../components/productDetail/ProductSummary';
import ProductDetailNav from '../components/productDetail/ProductDetailNav';
import ProductDetailInfo from '../components/productDetail/ProductDetailInfo';
import ProductPolicy from '../components/productDetail/ProductPolicy';
import ProductReviewList from '../components/productDetail/ProductReviewList';
import ProductQnA from '../components/productDetail/ProductQnA';
import mockProductDetail from '../data/mockProductDetail';

export default function ProductDetail() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);        // ← 표준화된 객체를 넣을 것
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('상품 설명');

  const location = useLocation();
  const [search] = useSearchParams();

  // 정기배송 더보기/로컬푸드 목록에서 온 경우에만 true
  const fromSubscription =
    location.state?.from === 'subscription' || search.get('from') === 'sub';
  const subscriptionOnly = !!fromSubscription;

  // ✅ 응답/목데이터를 표준 형태로 변환하는 함수
  const normalize = (d) => {
    if (!d || typeof d !== 'object') return null;

    const id = d.id ?? d.product_id ?? d.productId ?? Number(productId);
    const name =
      (d.name ?? d.title ?? d.product_name ?? '상품')?.toString().trim() || '상품';

    // 이미지 소스 통합 + 폴백
    const image =
      d.image_url ??
      d.image ??
      d.thumbnail ??
      d.main_image_url ??
      d.images?.[0]?.image_url ??
      d.images?.[0]?.url ??
      `https://picsum.photos/seed/${encodeURIComponent(String(id) || name || 'default')}/800/600`;

    return {
      id,
      name,
      title: name, // 일부 하위 컴포넌트가 title을 볼 수도 있으니 함께 전달
      price: Number(d.price ?? 0),
      image,
      weight: d.weight ?? null,
      status: d.status ?? null,
      description: d.description ?? '',
      category: d.category ?? null,
      seller: d.seller ?? null,
      store: d.store ?? null,
      average_rating: Number(d.average_rating ?? d.avg_rating ?? 0),
      is_returnable: d.is_returnable ?? d.returnable ?? false,
      is_subscription: d.is_subscription ?? d.is_subscription_available ?? false,
      created_at: d.created_at ?? null,
      updated_at: d.updated_at ?? null,
      detail_page: d.detail_page ?? null,
    };
  };

  useEffect(() => {
    let alive = true;

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/products/${productId}`
        );

        // 404 등일 때 목데이터로 대체
        if (!res.ok) {
          const normalizedMock = normalize(mockProductDetail);
          if (alive) setProduct(normalizedMock);
          return;
        }

        const json = await res.json();
        const normalized = normalize(json?.data);
        if (alive) setProduct(normalized);
      } catch (err) {
        console.error('상품 정보를 불러오지 못했습니다. 예시 데이터를 사용합니다', err);
        const normalizedMock = normalize(mockProductDetail);
        if (alive) setProduct(normalizedMock);
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchProduct();
    return () => { alive = false; };
  }, [productId]);

  // 혹시나 product가 null일 때 대비
  const safeProduct = useMemo(() => product ?? normalize(mockProductDetail), [product]);

  if (loading) return <p>로딩 중...</p>;
  if (!safeProduct) return <p>상품을 찾을 수 없습니다.</p>;

  return (
    <div>
      <ShopNav />
      <ProductSummary product={safeProduct} subscriptionOnly={subscriptionOnly} />

      <ProductDetailNav
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <div style={{ padding: '24px' }}>
        {selectedCategory === '상품 설명' && <ProductDetailInfo product={safeProduct} />}
        {selectedCategory === '상세정보' && <ProductPolicy product={safeProduct} />}
        {selectedCategory === '후기' && <ProductReviewList productId={safeProduct.id} />}
        {selectedCategory === '문의' && <ProductQnA productId={safeProduct.id} />}
      </div>
    </div>
  );
}
