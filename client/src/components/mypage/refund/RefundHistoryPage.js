import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../order/SearchBar';
import Pagination from '../../common/pagination/Pagination';
import RefundItemCard from './RefundItemCard';

const mockData = [
  {
    status: 'success',
    data: {
      cancellations: [
        {
          refund_id: 1,
          order_id: 1,
          product_img: null,
          product_name: '유기농 사과',
          quantity: 2,
          status: 'PROCESSING',
          paymentInfo: { method: '카드', amount: 9900 },
          shipping_fee: 3000,
          refund_amount: 9900,
          created_at: '2025-07-25T00:05:41.000Z',
        },
        {
          refund_id: 2,
          order_id: 5,
          product_img: null,
          product_name: '친환경 바나나',
          quantity: 1,
          status: 'COMPLETED',
          paymentInfo: { method: '카드', amount: 12500 },
          shipping_fee: 3000,
          refund_amount: 12500,
          created_at: '2025-07-10T11:00:00Z',
        },
      ],
      pagination: { currentPage: 1, totalPages: 1, totalElements: 2, pageSize: 10 },
    },
  },
];

export default function RefundHistoryPage() {
  const navigate = useNavigate(); 
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [useMock, setUseMock] = useState(false);
  const [error, setError] = useState(null);
  const limit = 10;

  // ✅ 카드 클릭 시 환불 상세로 이동
      const openRefundDetail = (r) => {
        console.log('[OPEN REFUND]', r.refund_id, r.product_name);  // 디버그
        if (!r?.refund_id) return;       // product_id가 없으면 동작 안 함
        navigate(`/my/cancel/${r.refund_id}`);
      };

  useEffect(() => {
    const fetchRefunds = async () => {
      setLoading(true);
      setError(null);

      // 개발 중 강제로 목업을 쓰고 싶으면 여기를 true로 바꾸세요.
      const FORCE_MOCK = false;
      if (FORCE_MOCK) {
        const mock = mockData[0];
        const cancellations = mock.data?.cancellations ?? [];
        const pagination = mock.data?.pagination ?? { totalPages: 1 };
        setRefunds(cancellations);
        setTotalPages(pagination.totalPages);
        setUseMock(true);
        setLoading(false);
        return;
      }

      try {
        const accessToken = localStorage.getItem('accessToken');
        const base = process.env.REACT_APP_API_BASE_URL; // 반드시 .env에 설정 필요

        if (!base) {
          throw new Error('REACT_APP_API_BASE_URL 미설정');
        }

        const res = await fetch(`${base}/api/my/cancel?page=${currentPage}&limit=${limit}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          cache: 'no-store',
        });

        if (!res.ok) {
          throw new Error(`API 실패: ${res.status} ${res.statusText}`);
        }

        const json = await res.json();
        const cancellations = json.data?.cancellations ?? [];
        const pagination = json.data?.pagination ?? { totalPages: 1 };

        setRefunds(cancellations);
        setTotalPages(pagination.totalPages);
        setUseMock(false);
      } catch (err) {
        console.error('API 호출 실패:', err);
        // 개발 편의를 위해 실패 시 목업으로 폴백
        const mock = mockData[0];
        const cancellations = mock.data?.cancellations ?? [];
        const pagination = mock.data?.pagination ?? { totalPages: 1 };
        setRefunds(cancellations);
        setTotalPages(pagination.totalPages);
        setUseMock(true);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRefunds();
  }, [currentPage]);

  return (
    <div style={{ padding: '48px' }}>
      <div
        style={{
          fontWeight: 'bold',
          fontSize: '22px',
          textAlign: 'left',
          borderBottom: '1px solid gray',
          lineHeight: '2.5',
        }}
      >
        취소/반품/환불 내역
      </div>

      {useMock && (
        <div style={{ color: 'gray', marginTop: '12px', fontSize: '14px' }}>
          주문 내역이 없어 <b>임시 데이터(목업)</b>를 표시합니다.
        </div>
      )}

      {loading && <div style={{ marginTop: 16 }}>불러오는 중...</div>}

      {!loading && refunds.length === 0 && (
        <div style={{ marginTop: 16, color: '#666' }}>
          표시할 취소/반품/환불 내역이 없습니다.
        </div>
      )}

      {!loading && refunds.length > 0 && (
        <>
          <SearchBar />
          {/* RefundItemCard가 props 이름으로 refunds를 받는지 확인하세요! */}
          <RefundItemCard refunds={refunds} onSelect={openRefundDetail} />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </>
      )}

      {error && (
        <div style={{ marginTop: 12, color: '#c00', fontSize: 12 }}>
          (개발 참고용) API 오류: {error}
        </div>
      )}
    </div>
  );
}
