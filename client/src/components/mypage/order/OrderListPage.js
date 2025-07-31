import React, { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import OrderCardList from './OrderCardList';
import Pagination from '../../common/pagination/Pagination';

const mockOrders = [
    {
        order_id: 'ORD-20250713-0001',
        order_date: '2025-07-13T14:30:00Z',
        order_price: 55000,
        order_state: 'COMPLETED',
        delivery_status: 'DELIVERED',
        receiver_name: '구매자 이름',
        street: '서울특별시 종로구 세종대로 175',
        itemsPreview: [
            {
            product_id: 'PROD-1001',
            product_name: '유기농 사과',
            quantity: 2,
            price: 15000,
            },
        ],
        },
        {
        order_id: 'ORD-20250713-0002',
        order_date: '2025-07-13T14:30:00Z',
        order_price: 18000,
        order_state: 'COMPLETED',
        delivery_status: 'IN_DELIVERY',
        receiver_name: '구매자 이름',
        street: '서울특별시 종로구 세종대로 175',
        itemsPreview: [
            {
            product_id: 'PROD-1002',
            product_name: '유기농 감자',
            quantity: 1,
            price: 15000,
            },
        ],
        },
    ];

export default function OrderListPage() {
    const [orders, setOrders] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [hasError, setHasError] = useState(false); // 에러 상태 추가
    const limit = 10;

    useEffect(() => {
        const fetchOrders = async () => {
        const accessToken = localStorage.getItem('accessToken');

        try {
            const res = await fetch(
                `${process.env.REACT_APP_API_BASE_URL}/api/my/orders?page=${currentPage}&limit=${limit}`,
                {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                cache: 'no-store'  // ✅ 캐시 무시하고 항상 새로 요청
                }
            );

            if (!res.ok) throw new Error('주문 목록 불러오기 실패');

            const json = await res.json();
            console.log("서버 응답 전체:", json);
            
            const orders = Array.isArray(json.data) ? json.data : json.data?.orders ?? [];
            const pagination = json.data?.pagination ?? { totalPages: 1 };

            setOrders(mockOrders);
            setTotalPages(pagination.totalPages);

            setHasError(false); // 성공했으면 에러 상태 초기화

            if (!Array.isArray(json.data) && (!json.data?.orders || !json.data?.pagination)) {
                console.warn('⚠️ 예상한 구조가 아님', json);
            }
        
        } catch (err) {
            console.error('❌ 주문 API 호출 실패:', err);
            setOrders(mockOrders);       
            setTotalPages(1);
            setHasError(true);           // ✅ 에러 표시
        }
    };

        fetchOrders();
    }, [currentPage]);

    return (
        <div style={{ padding: '48px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '22px', textAlign: 'left' }}>주문/배송 조회</div>

            
                <div style={{ color: 'gray', marginTop: '12px', fontSize: '14px' }}>
                    주문 내역이 없어 테스트 용으로 임시 데이터를 사용합니다.
                </div>
        


            <SearchBar />
            <OrderCardList orders={orders} />
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
            />
        </div>
    );
}
