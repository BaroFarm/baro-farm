import React, {useState,useEffect, useMemo} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import OrderDetailCard from './OrderDetailCard';

  // 👉 임시 mock 데이터
    const mockOrder = {
        order_id: 1,
        order_date: '2025-07-13T14:30:00Z',
        order_price: 55000,
        order_state: '결제 완료',
        deliveryInfo: {
            delivery_status: '배송중',
            tracking_number: 1234567890,
            courier: '로젠택배',
            receiver_name: '구매자 이름',
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
            order_product_id: 1,
            product_id: 1,
            product_name: '유기농 사과',
            product_img: "~",
            order_product_quantity: 2,
            order_product_price: 15000,
            sellerName: '싱싱농산',
        },
        {
            order_product_id: 2,
            product_id: 2,
            product_name: '고구마 5kg',
            product_img: "~",
            order_product_quantity: 1,
            order_product_price: 25000,
            store_name: '사랑농원',
        },
        ],
    paymentInfo: {
        approved_at: '2025-07-13T14:30:00Z',
        amount: 55000,
        method: '카드',
        discountAmount: 5000,
        couponUsed: 'WELCOME_COUPON_10%',
        },
    };

export default function OrderDetail(){
    const navigate = useNavigate();
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [error, setError] = useState(null);
    const [usedMock, setUsedMock] = useState(false);

    // ✅ API에 보낼 ID 정규화: 숫자만 허용 (목록 페이지에서 숫자 PK를 넘겨오는 게 정석)
    const apiOrderId = useMemo(() => {
        // 이미 숫자면 그대로
        if (/^\d+$/.test(orderId)) return orderId;
            // "ORD-YYYYMMDD-####" 형식이면 서버 규약에 맞는 키를 넘겨야 함(가능하면 목록에서 숫자 PK를 사용)
            // 임시로는 그냥 원본 유지하되 404시 mock으로 폴백
        return orderId;
    }, [orderId]);

    useEffect(() => {
        const controller = new AbortController();

        const fetchOrderDetail = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    alert('로그인이 필요합니다.');
                    navigate('/login', { replace: true });
                    return;
                }
                const base = process.env.REACT_APP_API_BASE_URL;
                const url = `${base}/api/my/orders/${encodeURIComponent(apiOrderId)}`;

                const res = await fetch(url, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    signal: controller.signal,
                });
                
                if (res.status === 401) {
                    alert("세션이 만료되었습니다. 다시 로그인해주세요.");
                    localStorage.clear();
                    navigate('/login', { replace: true });
                    return;
                }

                if (res.status === 404) {
                    console.warn('🔔 주문 내역이 없어 mock 데이터로 대체합니다.');
                    setOrder(mockOrder);
                    setUsedMock(true);
                    return;
                }

                if (!res.ok) throw new Error('주문 상세 조회 실패');
                
                const json = await res.json();
                setOrder(json.data);
                setUsedMock(false);
            } catch (err) {
                if (err.name === 'AbortError') return;
                // 네트워크/서버 에러 표시
                setError(err.message || '네트워크 오류');
            }
        };

        fetchOrderDetail();
        return () => controller.abort();
    }, [apiOrderId, navigate]);

    if (error) return <div style={{ padding: '48px' }}>오류: {error}</div>;
    if (!order) return <div style={{ padding: '48px' }}>불러오는 중...</div>;

    return(
        <div style={{ padding: '48px' }}>
            <div style={{ fontWeight:'bold', fontSize:'22px', textAlign:'left',borderBottom: '1px solid gray',lineHeight: '2.5',
                }}>주문 상세</div>

            
                {usedMock && (
                    <div style={{ color: 'gray', marginTop: 12, fontSize: 14 }}>
                        주문 내역이 없어 테스트용 임시 데이터를 사용합니다. (리스트 → 상세로 이동 시 숫자 PK 전달 권장)
                    </div>
                )}
        
            <SearchBar />
            <OrderDetailCard order={order}/>

        </div>
    );
}