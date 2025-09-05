// src/seller/MemberInfoPage.js
import React, { useEffect, useState } from 'react';
import { MdAccountCircle } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

const BASE = (process.env.REACT_APP_API_BASE_URL || '').replace(/\/$/, '');

export default function MemberInfoPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [storeId, setStoreId] = useState(null);

  // 판매자(사람)
  const [seller, setSeller] = useState({
    name: '', email: '', phone: '', contact: '', license_number: '',
  });
  // 스토어(농가)
  const [store, setStore] = useState({
    name: '', zip_code: '', street: '', detail: '',
  });

  // --- (1) 이 컴포넌트 내부에서만 쓰는 유틸들 ---
  const safeDecodeJwt = (t) => {
    if (!t) return null;
    try {
      const b64 = t.split('.')[1];
      const json = decodeURIComponent(
        atob(b64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
      );
      return JSON.parse(json);
    } catch { return null; }
  };

  const fetchAuth = async (path, options = {}) => {
    const token = localStorage.getItem('accessToken') || '';
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    const res = await fetch(`${BASE}${path}`, { ...options, headers });
    if (res.status === 401) {
      // 토큰 만료 등 → 로그인으로
      ['accessToken','refreshToken','userType','storeId','userId','userEmail'].forEach(k => localStorage.removeItem(k));
      navigate('/login?reason=expired', { replace: true });
      throw new Error('401 Unauthorized');
    }
    return res;
  };

  const resolveStoreIdHere = async () => {
    // 1) localStorage
    let id = localStorage.getItem('storeId');
    if (id) return id;

    // 2) JWT payload
    const payload = safeDecodeJwt(localStorage.getItem('accessToken') || '');
    id = payload?.store_id ?? payload?.seller?.store_id ?? null;
    if (id) {
      localStorage.setItem('storeId', String(id));
      return String(id);
    }

    // 3) /api/my/profile
    try {
      const res = await fetchAuth('/api/seller');
      const json = await res.json();
      const d = json?.data ?? json;
      id = d?.store_id ?? d?.Seller?.store_id ?? d?.seller?.store_id ?? null;
      if (id) localStorage.setItem('storeId', String(id));
      return id;
    } catch {
      return null;
    }
  };

  // --- (2) 데이터 로드 ---
  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr('');
      try {
        const id = await resolveStoreIdHere();
        if (!id) throw new Error('store_id를 찾을 수 없습니다.');
        setStoreId(id);

        const [sellerRes, storeRes] = await Promise.all([
          fetchAuth(`/api/seller?store_id=${encodeURIComponent(id)}`),
          fetchAuth(`/api/store`),
        ]);

        if (!sellerRes.ok) throw new Error(`판매자 조회 실패(${sellerRes.status})`);
        if (!storeRes.ok)  throw new Error(`스토어 조회 실패(${storeRes.status})`);

        const sellerJson = await sellerRes.json();
        const sData = sellerJson?.data ?? sellerJson;
        setSeller({
          name: sData?.name ?? '',
          email: sData?.email ?? '',
          phone: sData?.phone ?? '',
          contact: sData?.contact ?? '',
          license_number: sData?.license_number ?? '',
        });

        const storeJson = await storeRes.json();
        const stData = storeJson?.data ?? storeJson;
        setStore({
          name: stData?.name ?? '',
          zip_code: stData?.zip_code ?? '',
          street: stData?.street ?? '',
          detail: stData?.detail ?? '',
        });
      } catch (e) {
        console.error(e);
        setErr(e.message || '정보 조회 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const verified = !!seller.license_number;
  const handleBack = () => navigate(-1);

  return (
    <div style={pageWrap}>
      <div style={card}>
        <h2 style={title}>회원 정보</h2>

        <div style={topRow}>
          <MdAccountCircle size={40} color="#1d1d1f" style={{ marginRight: '10px' }} />
          <span style={realname}>{loading ? '불러오는 중...' : (seller.name || '정보가 없습니다')}</span>
          <button type="button" style={verifyBtn} title={verified ? '인증 완료' : '미인증'}>
            신원 인증
            <span style={{ ...verifyDot, backgroundColor: verified ? '#10b981' : '#cbd5e1' }} aria-hidden />
          </button>
        </div>

        {err && (
          <div style={{ color:'#b91c1c', background:'#fee2e2', borderRadius:8, padding:'10px 12px', marginBottom:12 }}>
            {err}
          </div>
        )}

        <div style={grid}>
          <Label>회원 유형</Label>
          <span style={badgeSeller}>판매자</span>

          <Label>이름</Label>
          <ReadOnly value={seller.name || ''} />

          <Label>이메일</Label>
          <ReadOnly value={seller.email || ''} />

          <Label>비밀번호</Label>
          <button type="button" style={btnGreenSm} onClick={() => alert('비밀번호 변경 페이지/모달 연결 필요')}>
            비밀번호 변경
          </button>

          <Label>전화번호</Label>
          <ReadOnly value={seller.phone || ''} />

          <div style={divider} />
          <div style={divider} />

          {/* /api/store */}
          <Label>상호명</Label>
          <ReadOnly value={store.name || ''} />

          <Label>우편주소</Label>
          <ReadOnly value={store.zip_code || ''} />

          <Label>도로명 주소</Label>
          <ReadOnly value={store.street || ''} />

          <Label>상세 주소</Label>
          <ReadOnly value={store.detail || ''} />

          <Label>통신판매번호</Label>
          <ReadOnly value={seller.license_number || ''} />

          <Label>고객 응대 연락처</Label>
          <ReadOnly value={seller.contact || ''} />
        </div>

        <div style={footer}>
          <button type="button" style={btnGhost} onClick={handleBack}>뒤로</button>
          <button type="button" style={{ ...btnGreenLg, opacity:0.6, cursor:'not-allowed' }} title="서버 저장 엔드포인트 필요">
            수정
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- 재사용 소품/스타일 (그대로) ---------- */
const Label = ({ children }) => <label style={labelStyle}>{children}</label>;
const ReadOnly = ({ value }) => <input value={value} readOnly style={{ ...inputBase, backgroundColor: '#fff' }} />;

const pageWrap = { padding:'24px', background:'linear-gradient(180deg,#ffffff 0%, #f6f8f3 100%)', minHeight:'100dvh' };
const card = { maxWidth:880, margin:'0 auto', backgroundColor:'#f9fbf7', borderRadius:16, padding:28, boxShadow:'0 2px 10px rgba(0,0,0,0.04)', border:'1px solid #e7eedf' };
const title = { fontSize:18, fontWeight:'bold', marginBottom:20, color:'#1b1b1b' };
const topRow = { display:'flex', alignItems:'center', gap:10, marginBottom:18 };
const realname = { fontWeight:600, color:'#333' };
const verifyBtn = { display:'inline-flex', alignItems:'center', gap:6, padding:'6px 10px', background:'#fff', border:'1px solid #dfe7f9', borderRadius:10, color:'#4a5568', cursor:'default' };
const verifyDot = { width:16, height:16, borderRadius:'50%', backgroundColor:'#246bfd', display:'inline-block' };
const grid = { display:'grid', gridTemplateColumns:'140px 1fr', columnGap:16, rowGap:14 };
const divider = { gridColumn:'1 / -1', height:1, backgroundColor:'#dcdcdc', margin:'6px 0' };
const badgeSeller = { display:'inline-block', backgroundColor:'#d8e8ca', color:'#2b4d1f', padding:'4px 10px', fontSize:13, borderRadius:10, fontWeight:600, width:'fit-content' };
const labelStyle = { alignSelf:'center', color:'#333', fontSize:16, fontWeight:700 };
const inputBase = { width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid #d5d5d5', outline:'none', fontSize:14, color:'#2d2d2d', backgroundColor:'#fff' };
const btnGreenSm = { backgroundColor:'#d8e8ca', border:'1px solid #cfe1c1', borderRadius:8, padding:'8px 14px', fontSize:14, cursor:'pointer' };
const footer = { marginTop:26, display:'flex', justifyContent:'center', gap:12 };
const btnGhost = { backgroundColor:'#fff', border:'1px solid #d5d5d5', borderRadius:10, padding:'10px 18px', fontSize:14, cursor:'pointer' };
const btnGreenLg = { backgroundColor:'#cfe4b8', border:'1px solid #b9d79a', borderRadius:10, padding:'10px 22px', fontSize:14, fontWeight:700, cursor:'pointer', boxShadow:'0 1px 0 rgba(0,0,0,0.04) inset' };
