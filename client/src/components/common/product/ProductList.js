import React, { useEffect, useState } from "react";
import axios from "axios";
import ProductGrid from "./ProductGrid";
import {mockProducts} from "../../../data/mockProducts";

//비회원인 경우 userId
function generateNewGuestId() {
  return "guest_" + Date.now() + "_" + Math.floor(Math.random() * 10000);
}

export default function ProductList({
    type="all", //all 또는 subscription
    category,
    region,
    sort = "latest",
    page = 1,
    limit = 20,
    onTotalPagesChange,
}) {
    const BASE = process.env.REACT_APP_API_BASE_URL;

    const [products, setProducts] = useState([]);

    
    const isSubList = type === "subscription"; // ← 정기배송 목록인지 판별

     // 게스트 아이디를 localStorage에서 불러오거나 새로 생성
    const guestUserIdRef = React.useRef(null);
    

    if (!guestUserIdRef.current) {
        let id = localStorage.getItem("guestUserId");
        if (!id) {
            id = generateNewGuestId();
            localStorage.setItem("guestUserId", id);
        }
        guestUserIdRef.current = id;
    }
    
    useEffect(() => {
        const fetchProducts = async () => {
            console.log("fetchProducts 실행");
            try {
                const accessToken = localStorage.getItem("accessToken");

                const headers = {
                    "Content-Type": "application/json",
                    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
                };

                const params = {
                    ...(category ? { category } : {}), // 선택적 파라미터
                    ...(category && region && { region }),  // ✅ category가 있을 때만 지역 필터 추가
                    sort,
                    page,
                    limit,
                    ...(accessToken ? {} : { user_id: guestUserIdRef.current }),
                };
                
                // 👇 엔드포인트 분기 처리
                // const endpoint =
                //     type === "subscription"
                //     ? `${process.env.REACT_APP_API_BASE_URL}/api/products/subscription`
                //     : category
                //     ? `${process.env.REACT_APP_API_BASE_URL}/api/products/category`
                //     : `${process.env.REACT_APP_API_BASE_URL}/api/products`;
                const path =
                    type === "subscription"
                        ? "/api/products/subscription"
                        : "/api/products"; // all
                
                const url = new URL(path, BASE);
                
                // const response = await axios.get(endpoint, {
                //         headers,
                //         params,
                //     }
                // );

                Object.entries(params).forEach(([k, v]) => {
  if (v !== undefined && v !== null && v !== "") {
    url.searchParams.set(k, v);
  }
});

const response = await axios.get(url.toString(), { headers });

            if (response.data.status === "success") {
                // 필요한 데이터 가공 (별점이 없으면 0으로)
                const total = response.data.pagination.total_pages;
                onTotalPagesChange(total);
                
                const productsWithRating = response.data.products.map((item) => ({
                    id: item.product_id,
                    name: item.name || item.title,
                    price: item.price,
                    image: item.image_url,
                    rating: item.average_rating || 0,
                    isSubscription: item.is_subscription_available,
                }));

                setProducts(productsWithRating);
            } else {
                alert("상품 정보를 불러올 수 없습니다.");
            }
        } catch (error) {
            console.error("상품 불러오기 실패", error);
            //alert("상품 정보를 불러올 수 없습니다.");
            // 임시: 백엔드 연결 안됐을 때 더미 데이터로 테스트
        
            let filteredMock = mockProducts;

  if (type === "subscription") {
    filteredMock = mockProducts.filter(item => item.is_subscription_available);
  } else if (type === "category" && category) {
    filteredMock = mockProducts.filter(item => item.category === category);
  }
  // else "all"인 경우는 그대로 사용

  const productsWithRating = filteredMock.map((item) => ({
    id: item.product_id,
    name: item.name,
    price: item.price,
    image: item.image_url,
    rating: item.average_rating || 0,
    isSubscription: item.is_subscription_available,
  }));

  setProducts(productsWithRating);
  console.log("💥 setProducts 호출:", productsWithRating);
            }
        };

        fetchProducts();
    }, [type, category, region, sort, page, limit, onTotalPagesChange]);

    return (
        
        <ProductGrid products={products} title="로컬푸드 목록 " forceFrom={ isSubList ? "sub" : undefined }  />
                
    );
}
