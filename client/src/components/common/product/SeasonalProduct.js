import React, { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "./ProductCard";

export default function SeasonalProduct() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchSeasonalProducts = async () => {
            try {
                const response = await axios.get("https://api.baro-farm.com/api/products/seasonal", {
                    headers: {
                        "Content-Type": "application/json",
                        // 토큰이 있을 경우 (회원): Authorization 헤더 추가
                        Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`
                    },
                    params: {
                    // 비회원일 경우 user_id를 쿼리로 전달
                        user_id: "guest_20250713"
                    }
                });

                const data = response.data.data;

                 // 별점 추가: (없으면 0으로 설정)
                const productsWithRating = data.map((item) => ({
                    ...item,
                    name: item.title,
                    rating: item.rating || 0,
                    image: item.image_url,
                }));

                setProducts(productsWithRating);
            } catch (error) {
                console.error("제철 상품 불러오기 실패", error);
                alert("상품 정보를 불러올 수 없습니다.");
            }
        };

        fetchSeasonalProducts();
    }, []);

    return (
        <div className="w-full px-4">
            <h2 className="text-xl font-bold mb-4">제철 상품 추천</h2>
            <div className="flex gap-4 flex-wrap justify-start">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
}
