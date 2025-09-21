// src/seller/MemberInfoPage.js
import React, { useEffect, useState } from 'react';
import { MdAccountCircle } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import SearchAddressModal from '../components/modal/SearchAddressModal';
import PasswordModal from '../components/seller/PasswordModal';

const BASE = (process.env.REACT_APP_API_BASE_URL || '').replace(/\/$/, '');

export default function MemberInfoPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false); //회원정보 수정
  const [ok, setOk]           = useState(''); //회원정보 수정
  const [err, setErr] = useState('');
  const [storeId, setStoreId] = useState(null);

  // 판매자(사람) - 원본
  const [seller, setSeller] = useState({
    name: '', email: '', phone: '', contact: '', license_number: '',
  });
  // 스토어(농가) - 원본
  const [store, setStore] = useState({
    name: '', zip_code: '', street: '', detail: '',
  });

  //수정 모드
  const [editing, setEditing] = useState(false);
  const [formSeller, setFormSeller] = useState(null);
  const [formStore, setFormStore]   = useState(null);

  // 비번 모달
  const [pwOpen, setPwOpen] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwErr, setPwErr] = useState('');

  // 주소 찾기 모달
  const [addrOpen, setAddrOpen] = useState(false);

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
        // store_id 없이도 현재 로그인 사용자 기준으로 받기
        const [sellerRes, storeRes] = await Promise.all([
          fetchAuth(`/api/seller`),
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
          zip_code: stData?.zip_code ?? stData?.zipCode ?? '',
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

  //편집 기능
  const startEdit = () => {
    setFormSeller(seller);
    setFormStore(store);
    setEditing(true);
    setOk('');
    setErr('');
  };
  const cancelEdit = () => {
    setEditing(false);
    setFormSeller(null);
    setFormStore(null);
    setOk('');
    setErr('');
  };

  // --- 저장(PATCH) ---
  const handleSave = async () => {
    if (!formSeller || !formStore) return;
    setSaving(true);
    setErr('');
    setOk('');
    try {
      // 변경된 값만 추출
      const diff = (orig, now) =>
        Object.fromEntries(Object.entries(now).filter(([k, v]) => v !== (orig?.[k] ?? '')));

      const sellerPatch = diff(seller, formSeller);
      const storePatch  = diff(store,  formStore);

      // 이메일은 보통 서버에서 변경 제한. form에서 빠르게 제외
      delete sellerPatch.email;
      // ✅ zip_code만 바뀐 경우 서버가 zipCode만 받을 가능성 대비해서 둘 다 세팅
    const storePayload = { ...storePatch };
    if ('zip_code' in storePatch) {
      storePayload.zipCode = storePatch.zip_code;
    }

      // 판매자 PATCH (/api/seller)
      if (Object.keys(sellerPatch).length) {
        const res = await fetchAuth('/api/seller', {
          method: 'PATCH',
          body: JSON.stringify(sellerPatch),
        });
        if (!res.ok) throw new Error(`판매자 저장 실패(${res.status})`);
      }
      if (Object.keys(storePayload).length) {
      const res2 = await fetchAuth('/api/store', {
        method: 'PATCH',
        body: JSON.stringify(storePayload),
      });
      // 일부 서버는 변경 없음/필드 미스매치에도 404를 내려줄 수 있음 → 아래에서 재조회로 판별
      if (!res2.ok && res2.status !== 404) {
        throw new Error(`스토어 저장 실패(${res2.status})`);
      }
    }
      // 성공 → 화면 갱신
      // ✅ 무조건 재조회해서 서버 값으로 동기화 (404여도 실제로 반영됐을 수 있음)
    const refreshed = await fetchAuth('/api/store');
    if (refreshed.ok) {
      const js = await refreshed.json();
      const d  = js?.data ?? js;
      setStore({
        name: d?.name ?? '',
        zip_code: d?.zip_code ?? d?.zipCode ?? '',
        street: d?.street ?? '',
        detail: d?.detail ?? '',
      });
    } else {
      // 재조회도 실패하면 폼 값으로라도 유지
      setStore(formStore);
    }
      setSeller(formSeller);
      setEditing(false);
      setFormSeller(null);
      setFormStore(null);
      setOk('저장되었습니다.');
    } catch (e) {
      console.error(e);
      setErr(e.message || '저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // 비번 변경 호출
const submitPassword = async ({ current_password, new_password }) => {
  setPwSaving(true);
  setPwErr('');
  try {
    // 서버 명세에 맞춰 필드명 선택: password 또는 new_password
    const res = await fetchAuth('/api/seller', {
      method: 'PATCH',
      body: JSON.stringify({
        // requireCurrent 정책이 생기면 current_password를 서버에서도 검사하도록 사용
        // current_password,
        password: new_password, // 서버가 password로 받는다고 가정
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`비밀번호 변경 실패(${res.status}) ${t || ''}`);
    }

    setPwOpen(false);
    setOk('비밀번호가 변경되었습니다.');
    // 보안정책 도입 시: 변경 후 재로그인 유도
    // localStorage.clear();
    // navigate('/login?reason=password_changed', { replace:true });
  } catch (e) {
    setPwErr(e.message || '비밀번호 변경 중 오류가 발생했습니다.');
    throw e;
  } finally {
    setPwSaving(false);
  }
};

  // ✅ 주소 검색: Authorization 포함해서 서버 호출
const handleAddressSearch = async ({ city, road, page, limit }) => {
  const q = new URLSearchParams({
    city,
    road,
    page: String(page),
    limit: String(limit),
  });
  const res = await fetchAuth(`/api/address/search?${q.toString()}`);
  if (!res.ok) throw new Error(`주소 검색 실패(${res.status})`);
  const json = await res.json();

  // 응답 정규화 (모달이 기대하는 형태)
  const results =
    Array.isArray(json?.results) ? json.results :
    Array.isArray(json?.data?.results) ? json.data.results : [];
  const total =
    Number(json?.pagination?.total ?? json?.data?.pagination?.total ?? 0);

  return { results, total };
};
  // 주소 모달에서 항목 선택 시: zip_code / street 채우기
  const handleSelectAddress = (r) => {
    setFormStore(s => ({
      ...(s ?? {}),
      zip_code: r?.postcode ?? '',
      street:   r?.road ?? (s?.street ?? ''),
      // detail은 사용자가 직접 입력하도록 유지
    }));
    setAddrOpen(false);
  };

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
          {editing
            ? <EditableInput editing value={formSeller?.name ?? ''} onChange={e=>setFormSeller(s=>({...s, name:e.target.value}))}/>
            : <ReadOnly value={seller.name || ''} />}

          <Label>이메일</Label>
          <ReadOnly value={seller.email || ''} />

          <Label>비밀번호</Label>
          <button type="button" style={btnGreenSm} onClick={() => setPwOpen(true)} disabled={saving}>
            비밀번호 변경
          </button>

          <Label>전화번호</Label>
          {editing
            ? <EditableInput editing value={formSeller?.phone ?? ''} onChange={e=>setFormSeller(s=>({...s, phone:e.target.value}))}/>
            : <ReadOnly value={seller.phone || ''} />}

          <div style={divider} />

          {/* /api/store */}
          <Label>상호명</Label>
          {editing
            ? <EditableInput editing value={formStore?.name ?? ''} onChange={e=>setFormStore(s=>({...s, name:e.target.value}))}/>
            : <ReadOnly value={store.name || ''} />}

          <Label>우편주소</Label>
          {editing ? (
            <div style={addrRow}>
              <EditableInput editing
                value={formStore?.zip_code ?? ''}
                onChange={(e)=>setFormStore(s=>({...s, zip_code:e.target.value}))}
              />
              <button type="button" style={addrBtn} onClick={()=>setAddrOpen(true)}>
                주소 찾기
              </button>
            </div>
          ) : (
            <ReadOnly value={store.zip_code || ''} />
          )}

          <Label>도로명 주소</Label>
          {editing
            ? <EditableInput editing value={formStore?.street ?? ''} onChange={e=>setFormStore(s=>({...s, street:e.target.value}))}/>
            : <ReadOnly value={store.street || ''} />}

          <Label>상세 주소</Label>
          {editing
            ? <EditableInput editing value={formStore?.detail ?? ''} onChange={e=>setFormStore(s=>({...s, detail:e.target.value}))}/>
            : <ReadOnly value={store.detail || ''} />}

          <Label>통신판매번호</Label>
          {editing
            ? <EditableInput editing value={formSeller?.license_number ?? ''} onChange={e=>setFormSeller(s=>({...s, license_number:e.target.value}))}/>
            : <ReadOnly value={seller.license_number || ''} />}

          <Label>고객 응대 연락처</Label>
          {editing
            ? <EditableInput editing value={formSeller?.contact ?? ''} onChange={e=>setFormSeller(s=>({...s, contact:e.target.value}))}/>
            : <ReadOnly value={seller.contact || ''} />}
        </div>

        <div style={footer}>
          <button type="button" style={btnGhost} onClick={editing ? cancelEdit : handleBack} disabled={saving}>{editing ? '취소' : '뒤로'}</button>
          {!editing ? (
            <button
              type="button"
              style={btnGreenLg}
              onClick={startEdit}
              disabled={loading || saving}
              title="수정 모드"
            >
              수정
            </button>
          ) : (
            <button
              type="button"
              style={{ ...btnGreenLg, opacity: saving ? 0.6 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}
              onClick={handleSave}
              disabled={saving}
              title="서버 저장"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
          )}
        </div>
      </div>
      {/* 주소 찾기 모달 */}
      <SearchAddressModal
        isOpen={addrOpen}
        onClose={()=>setAddrOpen(false)}
        onSearch = {handleAddressSearch}
        onSelect={handleSelectAddress}
        // 필요하면 기본값을 내려줄 수 있음
        initialResults={undefined}
        defaultCity=""
        defaultRoad=""
        defaultPage={1}
        defaultLimit={10}
      />
      <PasswordModal
        isOpen={pwOpen}
        onClose={() => { setPwOpen(false); setPwErr(''); }}
        onSubmit={({ current_password, new_password }) => submitPassword({ current_password, new_password })}
        saving={pwSaving}
        serverError={pwErr}
        requireCurrent={false}  // 정책 정해지면 true로만 바꾸면 됨
        minLen={8}
      />
    </div>
  );
}

/* ---------- 재사용 소품/스타일 (그대로) ---------- */

const pageWrap = { padding:'24px', minHeight:'100dvh' };
const card = { maxWidth:880, margin:'0 auto', backgroundColor:'#f9fbf7', borderRadius:16, padding:28, boxShadow:'0 2px 10px rgba(0,0,0,0.04)', border:'1px solid #e7eedf' };
const title = { fontSize:18, fontWeight:'bold', marginBottom:20, color:'#1b1b1b',};
const topRow = { display:'flex', alignItems:'center', gap:10, marginBottom:18 };
const realname = { fontWeight:600, color:'#333' };
const verifyBtn = { display:'inline-flex', alignItems:'center', gap:6, padding:'6px 10px', background:'#fff', border:'1px solid #dfe7f9', borderRadius:10, color:'#4a5568', cursor:'default' };
const verifyDot = { width:16, height:16, borderRadius:'50%', backgroundColor:'#246bfd', display:'inline-block' };
const grid = { display:'grid', gridTemplateColumns:'140px 1fr', columnGap:16, rowGap:14 };
const divider = { gridColumn:'1 / -1', height:1, backgroundColor:'#dcdcdc', margin:'6px 0' };
const badgeSeller = { display:'inline-block', backgroundColor:'#d8e8ca', color:'#2b4d1f', padding:'4px 10px', fontSize:13, borderRadius:10, fontWeight:600, width:'fit-content' };
const labelStyle = { alignSelf:'center', color:'#333', fontSize:16, fontWeight:700,  textAlign: 'left', marginLeft: '14px'};
const inputBase = { width:'80%', padding:'10px 12px', borderRadius:8, border:'1px solid #d5d5d5', outline:'none', fontSize:14, color:'#2d2d2d', backgroundColor:'#fff' };
const btnGreenSm = { width:'30%', backgroundColor:'#d8e8ca', border:'1px solid #cfe1c1', borderRadius:8, padding:'8px 14px', fontSize:14, cursor:'pointer' };
const footer = { marginTop:26, display:'flex', justifyContent:'center', gap:12 };
const btnGhost = { backgroundColor:'#fff', border:'1px solid #d5d5d5', borderRadius:10, padding:'10px 18px', fontSize:14, cursor:'pointer' };
const btnGreenLg = { backgroundColor:'#cfe4b8', border:'1px solid #b9d79a', borderRadius:10, padding:'10px 22px', fontSize:14, fontWeight:700, cursor:'pointer', boxShadow:'0 1px 0 rgba(0,0,0,0.04) inset' };

// 우편번호 입력 옆 '주소 찾기' 버튼 배치
const addrRow = { display:'flex', alignItems:'center', gap:8 };
const addrBtn = { background:'#cfe4b8', border:'1px solid #b9d79a', padding:'10px 12px', borderRadius:10, cursor:'pointer', fontSize:14, fontWeight:600 };

 // ---------- 공용 소품 컴포넌트 (모듈 스코프, 안정된 참조) ----------
  function Label({ children }) {
    return <label style={labelStyle}>{children}</label>;
  }

  function ReadOnly({ value }) {
    return <input value={value} readOnly style={{ ...inputBase, backgroundColor: '#fff' }} />;
  }

  // 메모까지 하면 포커스/조합 안정성 ↑
  const EditableInput = React.memo(function EditableInput({ value, onChange, editing }) {
    return (
      <input
        value={value}
        onChange={onChange}
        readOnly={!editing}
        style={{ ...inputBase, backgroundColor: editing ? '#fff9de' : '#f8f8f8' }}
      />
    );
  });