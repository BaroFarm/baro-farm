// src/components/mypage/order/OrderDetail.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import SearchBar from './SearchBar';
import OrderDetailCard from './OrderDetailCard';

// ── 임시 mock (404 등 폴백) ─────────────────────────────────────────────
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
      product_img: '~',
      order_product_quantity: 2,
      order_product_price: 15000,
      sellerName: '싱싱농산',
    },
    {
      order_product_id: 2,
      product_id: 2,
      product_name: '고구마 5kg',
      product_img: '~',
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

// 'ORD-YYYYMMDD-####' → 숫자 ID로 정규화
const toApiOrderId = (raw) => {
  if (/^\d+$/.test(raw)) return raw;
  const m = /^ORD-\d{8}-(\d+)$/.exec(raw);
  return m ? m[1] : raw;
};

export default function OrderDetail() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const location = useLocation();
  const state = location.state || {};
  const [searchParams] = useSearchParams();

  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [usedMock, setUsedMock] = useState(false);

  // 상세 API에서 쓸 orderId
  const apiOrderId = useMemo(() => toApiOrderId(orderId), [orderId]);

  // ✅ 리스트 카드에서 넘겨준 포커스 정보 (state 우선, 없으면 ?pid= / ?opid=)
  const focusProductId =
    location.state?.focusProductId || searchParams.get('pid') || null;
  const focusOrderProductId =
    location.state?.focusOrderProductId || searchParams.get('opid') || null;

  // ✅ 스냅샷이 있으면 먼저 그걸 화면에 띄워서 체감속도↑ (API로 나중에 덮어씀)
  useEffect(() => {
    if (state.orderSnapshot) {
      setOrder(state.orderSnapshot);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mount 시 한 번만

  // 실제 상세 API 호출
  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          alert('로그인이 필요합니다.');
          navigate('/login', { replace: true });
          return;
        }

        const base = (process.env.REACT_APP_API_BASE_URL || '').replace(/\/$/, '');
        if (!base) throw new Error('REACT_APP_API_BASE_URL 미설정');

        const res = await fetch(`${base}/api/my/orders/${encodeURIComponent(apiOrderId)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
          signal: controller.signal,
        });

        if (res.status === 401) {
          alert('세션이 만료되었습니다. 다시 로그인해주세요.');
          localStorage.clear();
          navigate('/login', { replace: true });
          return;
        }

        if (res.status === 404) {
          console.warn('🔔 주문 내역이 없어 mock 데이터로 대체합니다.');
          setOrder(mockOrder);
          setUsedMock(true);
          setError(null);
          return;
        }

        if (!res.ok) throw new Error(`주문 상세 조회 실패 (HTTP ${res.status})`);

        const json = await res.json();
        if (json.status !== 'success') throw new Error('API status != success');

        setOrder(json.data);      // ✅ 서버 포맷 그대로 사용
        setUsedMock(false);
        setError(null);
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error(err);
        setError(err.message || '네트워크 오류');
      }
    })();

    return () => controller.abort();
  }, [apiOrderId, navigate]);

  if (error) return <div style={{ padding: 48 }}>오류: {error}</div>;
  if (!order) return <div style={{ padding: 48 }}>불러오는 중...</div>;

  return (
    <div style={{ padding: 48 }}>
      <div
        style={{
          fontWeight: 'bold',
          fontSize: 22,
          textAlign: 'left',
          borderBottom: '1px solid gray',
          lineHeight: '2.5',
        }}
      >
        주문 상세
      </div>

      {usedMock && (
        <div style={{ color: 'gray', marginTop: 12, fontSize: 14 }}>
          주문 내역이 없어 테스트용 임시 데이터를 사용합니다. (리스트 → 상세는 <b>숫자 PK</b>로 전달 권장)
        </div>
      )}

      <SearchBar />

      {/* ✅ 클릭한 상품을 상단 대표로 보여주도록 포커스 정보 전달 */}
      <OrderDetailCard
        order={order}
        focusProductId={state?.focusProductId}
        focusOrderProductId={state?.focusOrderProductId}
      />
    </div>
  );
}
