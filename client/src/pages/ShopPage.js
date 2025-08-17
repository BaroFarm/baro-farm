import React, { useState} from 'react';
import useProducts from "../hooks/useProducts";
import ShopNav from '../components/common/ShopNav';
import PromoBanner from '../components/common/PromoBanner';
import SeasonalProduct from '../components/common/product/SeasonalProduct';
import Recommendations from '../components/common/product/Recommendations';
import Subscription from '../components/common/product/Subscription';
import ProductList from '../components/common/product/ProductList';
import Pagination from '../components/common/pagination/Pagination';

export default function ShopPage() {
  const [page, setPage] = useState(1);

  const { items: allProducts, totalPages } = useProducts({ page, limit: 40 });

  const seasonalProducts     = allProducts.filter(p => p.isSeasonal).slice(0,10);
  const recommendedProducts  = allProducts.filter(p => p.isRecommended).slice(0,10);
  const subscriptionProducts = allProducts.filter(p => p.isSubscription);

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
        type="all"
        //onTotalPagesChange={setTotalPages}
      />

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
