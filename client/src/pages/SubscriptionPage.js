import React, { useState } from "react";
import SeasonalProduct from '../components/common/product/SeasonalProduct';
import Recommendations from '../components/common/product/Recommendations';
import ProductList from '../components/common/product/ProductList';
import Pagination from '../components/common/pagination/Pagination';
import AIbotButton from '../components/common/buttons/AIbotButton';

export default function SubscriptionPage(){
    const [selectedCategory, setSelectedCategory] = useState("전체");
    const [selectedRegion, setSelectedRegion] = useState("");
    const [sort, setSort] = useState("latest");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(12);
    const [totalPages, setTotalPages] = useState(1);

    return(
        <>
        <div style={{ marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>정기배송 가능 상품</h2>
                <AIbotButton />
            </div>
        </div>
        <SeasonalProduct />
        <Recommendations />
        <ProductList
            type="subscription"
            category={selectedCategory === "전체" ? undefined : selectedCategory}
            region={selectedRegion || undefined}
            sort={sort}
            page={page}
            limit={limit}
            onTotalPagesChange={setTotalPages}
        />
        <Pagination currentPage={page}
                totalPages={totalPages}
                onPageChange={(newPage) => setPage(newPage)} />
        </>
    );
}