import React, {useEffect, useState} from 'react';
import axios from 'axios';
import ShopNav from '../components/common/ShopNav';
import PromoBanner from '../components/common/PromoBanner';
import SeasonalProduct from '../components/common/product/SeasonalProduct';
import Recommendations from '../components/common/product/Recommendations';
import Subscription from '../components/common/product/Subscription';
import ProductList from '../components/common/product/ProductList';
import Pagination from '../components/common/pagination/Pagination';

export default function ShopPage() {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [allProducts, setAllProducts] = useState([]);
  const limit = 40;

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/products`, {
          params: { page, limit }
        });
        if (res.data.status === 'success') {
          const mapped = (res.data.products || []).map(item => ({
            id: item.product_id ?? item.id,
            name: item.name || item.title,
            price: item.price,
            image: item.image_url ?? item.image,
            rating: item.average_rating ?? item.rating ?? 0,
            isSubscription: item.is_subscription_available ?? false,
            isSeasonal: item.isSeasonal ?? false,        // ← 백에서 주는 필드(없으면 너 로직으로 판단)
            isRecommended: item.isRecommended ?? false,  // ← 동일
          }));
          // 중복 방지
          const deduped = Array.from(new Map(mapped.map(p => [p.id, p])).values());
          setAllProducts(deduped);
          setTotalPages(res.data.pagination?.total_pages ?? 1);
        }
      } catch (e) {
        console.error(e);
        // 필요 시 mock으로 채우기
      }
    })();
  }, [page]);

  // 섹션별 분리 (필요에 맞게 조건 수정)
  const seasonalProducts      = allProducts.filter(p => p.isSeasonal).slice(0, 10);
  const recommendedProducts   = allProducts.filter(p => p.isRecommended).slice(0, 10);
  const subscriptionProducts  = allProducts.filter(p => p.isSubscription);

  return (
    <div>
      <ShopNav />
      <PromoBanner />

      {/* ✅ 하위 컴포넌트는 fetch 금지, props만 렌더 */}
      <SeasonalProduct products={seasonalProducts} />
      <Recommendations products={recommendedProducts} />
      <Subscription products={subscriptionProducts} />

      {/* ✅ 전체상품은 외부 products를 넘겨서 fetch 스킵 */}
      <ProductList
        products={allProducts}
        page={page}
        onTotalPagesChange={setTotalPages}
      />

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
