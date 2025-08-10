// pages/SubscriptionApplyPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';

export default function SubscriptionApplyPage() {
  const { productId } = useParams();
  const { state, pathname } = useLocation();
  const navigate = useNavigate();

  // 1) 기본 상품 정보 (state 스냅샷 우선, 없으면 API)
  const [product, setProduct] = useState(state?.productSnapshot ?? null);
  const [loading, setLoading] = useState(!state?.productSnapshot);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (state?.productSnapshot) return; // 이미 있음
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/products/${productId}`);
        if (!res.ok) throw new Error('상품 정보를 불러오지 못했습니다.');
        const json = await res.json();
        setProduct({
          id: json.data.product_id,
          title: json.data.title,
          price: json.data.price,
          image_url: json.data.image_url,
        });
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [productId, state?.productSnapshot]);

  // 2) 폼 상태
  const [quantity, setQuantity] = useState(1);
  const [receiver, setReceiver] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [startDate, setStartDate] = useState('');
  const [interval, setInterval] = useState('WEEKLY'); // WEEKLY / BIWEEKLY / MONTHLY
  const [memo, setMemo] = useState('');
  const [agree, setAgree] = useState(false);

  const productTotal = useMemo(() => (product ? product.price * quantity : 0), [product, quantity]);
  const shippingFee = useMemo(() => (productTotal >= 40000 ? 0 : 3000), [productTotal]);
  const finalTotal = productTotal + shippingFee;

  const submit = async () => {
    if (!agree) return alert('약관에 동의해 주세요.');
    // TODO: 로그인 가드/주소검증/전화번호 포맷 검증
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('로그인이 필요합니다.');
         navigate('/login', { state: { redirectTo: pathname } });
        return;
      }
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: Number(productId),
          quantity,
          start_date: startDate,
          interval,         // 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' 등 백엔드 합의
          receiver,
          phone,
          address,
          memo,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || '신청 실패');
      alert('정기배송 신청이 완료되었습니다.');
      navigate('/mypage/subscriptions');
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading) return <div style={{ padding: 24 }}>불러오는 중…</div>;
  if (err) return <div style={{ padding: 24, color: 'crimson' }}>{err}</div>;
  if (!product) return <div style={{ padding: 24 }}>상품을 찾을 수 없습니다.</div>;

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>정기배송 신청</h1>

      {/* 상단 요약 */}
      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 100px 120px', gap: 16, alignItems: 'center', marginBottom: 24 }}>
        <img src={product.image_url} alt={product.title} style={{ width: 120, height: 80, objectFit: 'cover' }} />
        <div style={{ fontWeight: 600 }}>{product.title}</div>
        <div style={{ textAlign: 'right' }}>{product.price.toLocaleString()}원</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'flex-end' }}>
          <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
          <span>{quantity}</span>
          <button onClick={() => setQuantity(quantity + 1)}>+</button>
        </div>
      </div>

      <hr style={{ margin: '16px 0' }} />

      {/* 신청자 정보 폼 */}
      <div style={{ border: '1px dashed #9b87f5', padding: 16, borderRadius: 8, marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 12px 0' }}>정기 배송 주문자 정보 입력</h3>

        <label>수령인*</label>
        <input value={receiver} onChange={e => setReceiver(e.target.value)} placeholder="수령인" style={inputStyle} />

        <label>연락처*</label>
        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="010-0000-0000" style={inputStyle} />

        <label>주소*</label>
        <input value={address} onChange={e => setAddress(e.target.value)} placeholder="주소 입력" style={inputStyle} />

        <label>정기 배송 시작일*</label>
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={inputStyle} />

        <label>배송 주기*</label>
        <select value={interval} onChange={e => setInterval(e.target.value)} style={inputStyle}>
          <option value="WEEKLY">매주</option>
          <option value="BIWEEKLY">격주</option>
          <option value="MONTHLY">매월</option>
        </select>

        <label>배송 메모</label>
        <input value={memo} onChange={e => setMemo(e.target.value)} placeholder="문 앞에 놓아주세요 등" style={inputStyle} />

        <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
          <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} />
          <span>약관에 동의합니다</span>
        </label>
      </div>

      {/* 금액 요약 */}
      <div style={{ marginTop: 12, marginBottom: 16 }}>
        <div>총 상품 금액 <b style={{ float: 'right' }}>{productTotal.toLocaleString()}원</b></div>
        <div>총 배송비 <b style={{ float: 'right' }}>{shippingFee.toLocaleString()}원</b></div>
        <div style={{ clear: 'both', marginTop: 8, fontWeight: 700 }}>
          최종 결제 금액 <b style={{ float: 'right' }}>{finalTotal.toLocaleString()}원</b>
        </div>
      </div>

      <button onClick={submit} style={{ background: '#B6D19B', border: 'none', borderRadius: 999, padding: '10px 20px', cursor: 'pointer' }}>
        정기 배송 신청
      </button>
    </div>
  );
}

const inputStyle = { display: 'block', width: '100%', height: 36, padding: '0 10px', margin: '6px 0 12px', border: '1px solid #ddd', borderRadius: 6 };
