import React, {useState} from 'react';
import {useParams} from 'react-router-dom';
import ShopNav from '../components/common/ShopNav';
import PromoBanner from '../components/common/PromoBanner';
import ProductList from '../components/common/product/ProductList';
import Pagination from '../components/common/pagination/Pagination';

export default function CategoryPage() {
// 현재 페이지 상태
    const [page, setPage] = useState(1); // 현재 페이지
    const [totalPages, setTotalPages] = useState(1); //전체 페이지(API에서 받아오기)
    
    const { category } = useParams(); // URL에서 :category 추출
    // URL 파라미터가 없으면 전체 상품으로 표시
    const categoryName = category ? decodeURIComponent(category) : "전체 상품";

    // const [region, setRegion] = useState("");
    // const regions = [   //예시) 나중에 백엔드 맞춰서 수정
    //     { label: "전체", value: "" },
    //     { label: "수원", value: "수원" },
    //     { label: "용인", value: "용인" },
    //     { label: "성남", value: "성남" },
    //     { label: "고양", value: "고양" },
    //     { label: "의정부", value: "의정부" },
    //     { label: "남양주", value: "남양주" },
    //     { label: "부천", value: "부천" },
    //     { label: "평택", value: "평택" },
    // ];

    return (
        <div>
            <ShopNav />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '24px 0 12px' }}>
        <h3 style={{ fontSize: '28px', fontWeight: 'bold' }}>{categoryName}</h3>

        {/* ⭐ 지역 선택 드롭다운 */}
        {/* <select
          value={region}
          onChange={(e) => {
            setPage(1); // 페이지 초기화
            setRegion(e.target.value);
          }}
          style={{ padding: '8px', fontSize: '16px', borderRadius: '6px' }}
        >
          {regions.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select> */}
      </div>

            <PromoBanner />
            <ProductList 
                category={category}
                page={page}
                onTotalPagesChange={setTotalPages}/>
            <Pagination 
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(newPage) => setPage(newPage)} />
            
        </div>
    );
}