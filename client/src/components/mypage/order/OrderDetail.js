import React, {useState,useEffect} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import OrderDetailCard from './OrderDetailCard';

  // 👉 임시 mock 데이터
    const mockOrder = {
        order_id: 'ORD-20250713-0001',
        order_date: '2025-07-13T14:30:00Z',
        order_price: 55000,
        order_state: 'DELIVERED',
        deliveryInfo: {
            delivery_status: 'DELIVERED',
            tracking_number: 'CJ1234567890',
            courier: 'CJ대한통운',
            reciever_name: '구매자 이름',
            receiver_phone: '010-1234-5678',
        deliveryAddress: {
            zipCode: '03187',
            street: '서울특별시 종로구 세종대로 175',
            detail: '광화문빌딩 10층',
        },
        delivered_at: '2025-07-14T18:00:00Z',
        deliveryHistory: [
            { timestamp: '2025-07-13T10:00:00Z', location: '서울 강남', description: '상품 인수' },
            { timestamp: '2025-07-13T12:00:00Z', location: '서울 종로', description: '배송 출발' },
            { timestamp: '2025-07-13T14:30:00Z', location: '배송지', description: '배송 완료' },
        ],
    },
    orderItems: [
        {
            order_product_id: 'ORI-001',
            product_id: 'PROD-1001',
            product_name: '유기농 사과',
            order_product_quantity: 2,
            order_product_price: 15000,
            sellerName: '싱싱농산',
        },
        {
            order_product_id: 'ORI-002',
            product_id: 'PROD-1002',
            product_name: '고구마 5kg',
            order_product_quantity: 1,
            order_product_price: 25000,
            store_name: '사랑농원',
        },
        ],
    paymentInfo: {
        approved_at: '2025-07-13T14:30:00Z',
        amount: 55000,
        method: 'CreditCard',
        discountAmount: 5000,
        couponUsed: 'WELCOME_COUPON_10%',
        },
    };

export default function OrderDetail(){
    const navigate = useNavigate();
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrderDetail = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/my/orders/${orderId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                    },
                });
                
                if (res.status === 401) {
                    alert("세션이 만료되었습니다. 다시 로그인해주세요.");

                    // localStorage에서 토큰 제거
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('userId');
                    localStorage.removeItem('userType');
                    localStorage.removeItem('tokenType');
                    localStorage.removeItem('userEmail');

                    navigate('/login');
                    return;
                }

                if (res.status === 404) {
                    console.warn('🔔 주문 내역이 없어 mock 데이터로 대체합니다.');
                    setOrder(mockOrder);
                    return;
                }

                if (!res.ok) throw new Error('주문 상세 조회 실패');
                const json = await res.json();
                setOrder(json.data);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchOrderDetail();
    }, [orderId, navigate]);

    if (error) return <div style={{ padding: '48px' }}>오류: {error}</div>;
    if (!order) return <div style={{ padding: '48px' }}>불러오는 중...</div>;

    return(
        <div style={{ padding: '48px' }}>
            <div style={{ fontWeight:'bold', fontSize:'22px', textAlign:'left',borderBottom: '1px solid gray',lineHeight: '2.5',
                }}>주문 상세</div>

            
                <div style={{ color: 'gray', marginTop: '12px', fontSize: '14px' }}>
                    주문 내역이 없어 테스트 용으로 임시 데이터를 사용합니다.
                </div>
        
            <SearchBar />
            <OrderDetailCard order={order}/>

        </div>
    );
}