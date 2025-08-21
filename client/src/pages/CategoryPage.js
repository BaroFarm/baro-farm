import React, {useState, useEffect} from 'react';
import {useParams} from 'react-router-dom';
import useProducts from '../hooks/useProducts';
import ShopNav from '../components/common/ShopNav';
import FilterBar from '../components/common/product/FilterBar';
import PromoBanner from '../components/common/PromoBanner';
import ProductList from '../components/common/product/ProductList';
import Pagination from '../components/common/pagination/Pagination';

export default function CategoryPage() {
// 현재 페이지 상태
    const [page, setPage] = useState(1); // 현재 페이지
   // const [totalPages, setTotalPages] = useState(1); //전체 페이지(API에서 받아오기)
    //const { category: categorySlug } = useParams(); 
    const { category: categorySlug } = useParams();
    const categoryName = categorySlug ? decodeURIComponent(categorySlug) : "전체 상품";
  // 백이 "쌀, 잡곡" 식으로 공백 포함이라면 프론트에서 복원
  const categoryParam = categorySlug ? decodeURIComponent(categorySlug).replace(/,/g, ', ') : '';
    const [filters, setFilters] = useState({ region: '', storeId: '', partner: '' });
    const handleFilterChange = (patch) => {
      setFilters((prev) => ({ ...prev, ...patch }));
      setPage(1);
    };


    // 카테고리 변경 시 페이지 1로
  useEffect(() => { setPage(1); }, [{categoryName}]);
const { items: products, totalPages } = useProducts({
  page,
  limit: 40,
  category: categoryParam,          // 문자열!
  region: filters.region,
  storeId: filters.storeId,
  partner: filters.partner,
});

useEffect(() => { setPage(1); }, [categoryParam, filters.region, filters.storeId, filters.partner]);

    return (
      <div>
        <ShopNav />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '24px 0 12px' }}>
        <h3 style={{ fontSize: '28px', fontWeight: 'bold' }}>{categoryName}</h3>
      </div>

      <PromoBanner />
      {/* 필터 바 (지금은 UI만, 값 전달만 해둠) */}
      <FilterBar
        region={filters.region}
        storeId={filters.storeId}
        partner={filters.partner}
        onChange={handleFilterChange}
      />
      <ProductList 
        products={products}
        page={page}
        //onTotalPagesChange={setTotalPages}
      />
      <Pagination 
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage} />
        
    </div>
    );
}