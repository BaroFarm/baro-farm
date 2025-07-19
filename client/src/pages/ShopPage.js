import React, {useState} from 'react';
import ShopNav from '../components/common/ShopNav';
import PromoBanner from '../components/common/PromoBanner';
import SeasonalProduct from '../components/common/product/SeasonalProduct';
import Recommendations from '../components/common/product/Recommendations';
import Subscription from '../components/common/product/Subscription';
import ProductList from '../components/common/product/ProductList';
import Pagination from '../components/common/pagination/Pagination';
export default function ShopPage() {
// 현재 페이지 상태
    const [page, setPage] = useState(1); // 현재 페이지
    const [totalPages, setTotalPages] = useState(1); //전체 페이지(API에서 받아오기)

    return (
        <div>
            <ShopNav />
            <PromoBanner />
            <SeasonalProduct />
            <Recommendations />
            <Subscription />
            <ProductList page={page}
                onTotalPagesChange={setTotalPages}/>
            <Pagination currentPage={page}
                totalPages={totalPages}
                onPageChange={(newPage) => setPage(newPage)} />
            
        </div>
    );
}