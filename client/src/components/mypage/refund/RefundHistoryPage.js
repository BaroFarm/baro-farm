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
        "refund_id": "CANC-001", 
        "order_id": "ORD-20250713-0001",
        "product_name": "유기농 사과",
        "quantity": 2,
        "amount": 30000, // 환불 금액
        "created_at": "2025-07-13T15:00:00Z", // 요청일
        "status": "PROCESSING", // 현재 처리 상태
        "paymentInfo": { 
            "method": "CreditCard", // 결제 수단
            "amount": 30000 // 원래 결제 금액
        },
        },
        {
        "refund_id": "CANC-002",
        "order_id": "ORD-20250710-0005",
        "product_name": "친환경 바나나",
        "quantity": 1,
        "amount": 5000,
        "created_at": "2025-07-10T11:00:00Z",
        "status": "COMPLETED",
        "paymentInfo": { 
            "method": "CreditCard", // 결제 수단
            "amount": 5000 // 원래 결제 금액
        },
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

    const useMockData = true; // 👉 나중에 false로 바꾸면 바로 API 연동됨

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