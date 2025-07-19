import React, { useEffect, useState } from "react";
import axios from "axios";
import ProductSlider from './ProductSlider';
//import ProductCard from "./ProductCard";

//비회원인 경우 userId
function generateNewGuestId() {
  return "guest_" + Date.now() + "_" + Math.floor(Math.random() * 10000);
}

export default function Recommendations() {
    const [products, setProducts] = useState([]);

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

                const params = accessToken ? {} : { user_id: guestUserIdRef.current };

                const response = await axios.get(
                    "https://api.baro-farm.com/api/products/recommendations",
                    {
                        headers,
                        params,
                    }
                );

            if (response.data.status === "success") {
                // 필요한 데이터 가공 (별점이 없으면 0으로)
                const productsWithRating = response.data.data.map((item) => ({
                    ...item,
                    name: item.title,
                    rating: item.rating || 0,
                    image: item.image_url,
                }));

                setProducts(productsWithRating);
            } else {
                alert("상품 정보를 불러올 수 없습니다.");
            }
        } catch (error) {
            console.error("상품 불러오기 실패", error);
            //alert("상품 정보를 불러올 수 없습니다.");
            // 임시: 백엔드 연결 안됐을 때 더미 데이터로 테스트
            setProducts([
                {
                    id: "101",
                    name: "감자",
                    image: "https://via.placeholder.com/200x150?text=감자",
                    price: 3200,
                    rating: 4.3,
                },
                {
                id: "102",
                name: "강원도 고구마",
                image: "https://via.placeholder.com/200x150?text=고구마",
                price: 5800,
                rating: 4.7,
                },
                                {
                    id: "103",
                    name: "감자",
                    image: "https://via.placeholder.com/200x150?text=감자",
                    price: 3200,
                    rating: 4.3,
                },
                                {
                    id: "104",
                    name: "감자",
                    image: "https://via.placeholder.com/200x150?text=감자",
                    price: 3200,
                    rating: 4.3,
                },
                                {
                    id: "105",
                    name: "감자",
                    image: "https://via.placeholder.com/200x150?text=감자",
                    price: 3200,
                    rating: 4.3,
                },
            ]);
            }
        };

        fetchProducts();
    }, []);


    return (
        <ProductSlider products={products} title="추천 상품" />
    );
}
