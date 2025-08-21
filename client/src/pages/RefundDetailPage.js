import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const KR = new Intl.DateTimeFormat('ko-KR');
const fmtKRW = (n) => (n ?? 0).toLocaleString();

export default function RefundDetailPage() {
  const { refundId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setErr(null);
      try {
        const base = process.env.REACT_APP_API_BASE_URL;
        if (!base) throw new Error('REACT_APP_API_BASE_URL 미설정');

        const accessToken = localStorage.getItem('accessToken');
        const res = await fetch(`${base}/api/my/cancel/${refundId}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          cache: 'no-store',
        });
        if (!res.ok) throw new Error(`상세 API 실패: ${res.status} ${res.statusText}`);

        const json = await res.json();
        setData(json.data?.cancellation || null);
      } catch (e) {
        console.error(e);
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [refundId]);

  const goBack = () => navigate(-1);

  if (loading) return <div style={{ padding: 24 }}>불러오는 중...</div>;
  if (err) return (
    <div style={{ padding: 24 }}>
      <button onClick={goBack} style={backBtnStyle}>← 뒤로</button>
      <div style={{ color: '#c00' }}>상세 로드 실패: {err}</div>
    </div>
  );
  if (!data) return (
    <div style={{ padding: 24 }}>
      <button onClick={goBack} style={backBtnStyle}>← 뒤로</button>
      <div>상세 정보가 없습니다.</div>
    </div>
  );

  const {
    refund_id, order_id, product_name, product_img, quantity,
    shipping_fee, paymentInfo, reason, status,
    refund_amount, created_at, refunded_at,
  } = data;

  return (
    <div style={{ padding: '48px' }}>
      {/* 상단 타이틀 바 - 리스트 페이지와 동일 톤 */}
      <div style={pageTitleStyle}>취소/반품/환불 내역 (상세)</div>
      <button onClick={goBack} style={{ ...backBtnStyle, margin: '16px 0 24px' }}>← 뒤로</button>
      {/* 카드 레이아웃: RefundItemCard와 동일 스타일 */}
      <div style={cardStyle}>
        <img
          src={product_img || 'https://www.outdoornews.co.kr/news/photo/202009/32077_90504_551.jpg'}
          alt="상품 이미지"
          style={thumbStyle}
        />

        <div style={{ fontSize: 14, flex: 1 }}>
          <div style={{ fontSize: 13, color: '#666', marginBottom: 6 }}>
            {created_at ? new Date(created_at).toLocaleDateString('ko-KR') : ''} 주문
          </div>

          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{product_name}</div>
          <div style={{ marginBottom: 4 }}>수량: {quantity}개</div>
          <div style={{ marginBottom: 4 }}>
            상품 가격: {(paymentInfo?.amount ?? 0).toLocaleString()}원
          </div>
          <div style={{ marginBottom: 4 }}>
            배송비: {(shipping_fee ?? 0).toLocaleString()}원
          </div>
          <div style={{ margin: '8px 0', fontWeight: 'bold' }}>
            환불 금액: {(refund_amount ?? 0).toLocaleString()}원
          </div>
          <div>결제 수단: {paymentInfo?.method ?? '-'}</div>
        </div>
      </div>

      {/* 디테일 블록: 같은 톤 유지, 살짝 연한 보더 */}
      <div style={detailBlockStyle}>
        <DetailRow label="환불 ID" value={refund_id} />
        <DetailRow label="주문 ID" value={order_id} />
        <DetailRow label="상태" value={status} />
        <DetailRow label="사유" value={reason ?? '-'} />
        <DetailRow label="환불 완료일" value={refunded_at ? KR.format(new Date(refunded_at)) : '-'} />
      </div>
    </div>
  );
}

/* ----- 작은 프레젠테이셔널 컴포넌트 ----- */
function DetailRow({ label, value }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '140px 1fr',
      gap: 8,
      padding: '8px 0',
      borderBottom: '1px solid #eee'
    }}>
      <div style={{ color: '#666' }}>{label}</div>
      <div style={{ fontWeight: 500 }}>{String(value ?? '-') }</div>
    </div>
  );
}

/* ----- 스타일 공통화: RefundItemCard와 동일하게 ----- */
const pageTitleStyle = {
  fontWeight: 'bold',
  fontSize: '22px',
  textAlign: 'left',
  borderBottom: '1px solid gray',
  lineHeight: '2.5',
};

const cardStyle = {
  width: '100%',
  textAlign: 'left',
  border: '1px solid #ccc',
  borderRadius: 16,
  padding: 24,
  marginBottom: 24,
  display: 'flex',
  gap: 16,
  background: 'white',
};

const thumbStyle = {
  width: 100,
  height: 100,
  borderRadius: 8,
  objectFit: 'cover',
};

const detailBlockStyle = {
  border: '1px solid #ddd',
  borderRadius: 12,
  padding: 16,
  background: '#fff',
};

const backBtnStyle = {
  border: '1px solid #ccc',
  background: '#fff',
  borderRadius: 8,
  padding: '6px 10px',
  cursor: 'pointer',
  fontSize: 14,
};
