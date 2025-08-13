import React, { useState, useEffect } from 'react';
import SearchBar from '../order/SearchBar';
import Pagination from '../../common/pagination/Pagination';
import RefundItemCard from './RefundItemCard';

const mockData = [
    {
    "status": "success",
    "data": {
    "cancellations": [
        {
        "refund_id": 1, 
        "order_id": 1,
        "product_img": null,
        "product_name": "유기농 사과",
        "quantity": 2,
        "status": "PROCESSING", // 현재 처리 상태
        "paymentInfo": { 
            "method": "카드", // 결제 수단
            "amount": 9900 // 원래 결제 금액
        },
        "shipping_fee": 3000, // 배송비
        "refund_amount": 9900, // 환불 금액
        "created_at": "2025-07-25T00:05:41.000Z", // 요청일
        },
        {
        "refund_id": 2,
        "order_id": 5,
        "product_img": null,
        "product_name": "친환경 바나나",
        "quantity": 1,
        "status": "COMPLETED",
        "paymentInfo": { 
            "method": "카드", // 결제 수단
            "amount": 12500 // 원래 결제 금액
        },
        "shipping_fee": 3000, //배송비
        "refund_amount": 12500,
        "created_at": "2025-07-10T11:00:00Z",

        }
    ],
    "pagination": {
        "currentPage": 1,
        "totalPages": 1,
        "totalElements": 2,
        "pageSize": 10
    }
    }
}
    ];

export default function RefundHistoryPage(){
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [refunds, setRefunds] = useState([]);
    const limit = 10;

    const useMockData = false; // 👉 나중에 false로 바꾸면 바로 API 연동됨

    useEffect(() => {
        const fetchRefunds = async () => {
            
            if (useMockData) {
                const mock = mockData[0]; // 구조 유지
                const cancellations = mock.data?.cancellations ?? [];
                const pagination = mock.data?.pagination ?? { totalPages: 1 };
                setRefunds(cancellations);
                setTotalPages(pagination.totalPages);
                return;
            }
            
            const accessToken = localStorage.getItem('accessToken');

            try {
                const res = await fetch(
                    `${process.env.REACT_APP_API_BASE_URL}/api/my/cancel?page=${currentPage}&limit=${limit}`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${accessToken}`,
                        },
                        cache: 'no-store',
                    }
                );

                if (!res.ok) throw new Error('❌ API 요청 실패');

                const json = await res.json();
                const cancellations = json.data?.cancellations ?? [];
                const pagination = json.data?.pagination ?? { totalPages: 1 };

                setRefunds(cancellations);
                setTotalPages(pagination.totalPages);
            } catch (err) {
                console.error('API 호출 실패:', err);
            }
        };

        fetchRefunds();
    }, [currentPage]);

    return(
        <div style={{ padding: '48px' }}>
            <div style={{ fontWeight:'bold', fontSize:'22px', textAlign:'left',borderBottom: '1px solid gray',lineHeight: '2.5',
                }}>취소/반품/환불 내역</div>
        
                    
            <div style={{ color: 'gray', marginTop: '12px', fontSize: '14px' }}>
                주문 내역이 없어 테스트 용으로 임시 데이터를 사용합니다.
            </div>
                
        
        
            <SearchBar />
            <RefundItemCard refunds={refunds}/>
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
            />
            
        </div>
    );
}