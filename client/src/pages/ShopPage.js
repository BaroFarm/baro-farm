import React, {useMemo, useState} from 'react';
import useProducts from "../hooks/useProducts";
import ShopNav from '../components/common/ShopNav';
import PromoBanner from '../components/common/PromoBanner';
import SeasonalProduct from '../components/common/product/SeasonalProduct';
import Recommendations from '../components/common/product/Recommendations';
import Subscription from '../components/common/product/Subscription';
import ProductList from '../components/common/product/ProductList';
import Pagination from '../components/common/pagination/Pagination';
//판매자인 경우
import NavBar from '../seller/NavBar';

// JWT payload 안전 파서 (base64url 대응)
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return {};
  }
}

// role 판별: localStorage → JWT → 기본 'buyer'
function getUserRole() {
  const fromLS = localStorage.getItem('userType') || localStorage.getItem('role');
  if (fromLS) return fromLS; // 'seller' | 'buyer'
  const token = localStorage.getItem('accessToken');
  if (token) {
    const p = parseJwt(token);
    return p.user_type || p.role || 'buyer';
  }
  return 'buyer';
}

export default function ShopPage() {
  const [page, setPage] = useState(1);
  const role = useMemo(getUserRole, []); // 'seller' | 'buyer'

  const { items: allProducts, totalPages } = useProducts({ page, limit: 40 });

  const seasonalProducts     = allProducts.filter(p => p.isSeasonal).slice(0,10);
  const recommendedProducts  = allProducts.filter(p => p.isRecommended).slice(0,10);
  const subscriptionProducts = allProducts.filter(p => p.isSubscription);

  return (
    <div>
      {/* 판매자면 NavBar, 아니면 기존 ShopNav */}
      {role === 'seller' ? <NavBar /> : <ShopNav />}
      <PromoBanner />

      {/* ✅ 하위 컴포넌트는 fetch 금지, props만 렌더 */}
      <SeasonalProduct products={seasonalProducts} />
      {/* 판매자면 추천 리스트 숨김 */}
      {role !== 'seller' && <Recommendations products={recommendedProducts ?? []} />}
      
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
