import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ProductFormPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    category_id: "",
    weight: "",
    price: "",
    direct_store_id: "",
    returnable: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleReturnable = (value) => {
    setFormData((prev) => ({ ...prev, returnable: value }));
  };

  const toInt = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : NaN;
  };

  const validate = () => {
    const errors = [];
    if (!formData.title.trim()) errors.push('상품명');
    if (!Number.isFinite(toInt(formData.weight))) errors.push('용량');
    if (!Number.isFinite(toInt(formData.category_id))) errors.push('카테고리');
    if (!Number.isFinite(toInt(formData.price))) errors.push('가격');
    if (!Number.isFinite(toInt(formData.direct_store_id))) errors.push('직매장');
    if (typeof formData.returnable !== 'boolean') errors.push('반품 가능 여부');

    if (errors.length) {
      alert(`다음 항목을 확인해주세요: ${errors.join(', ')}`);
      return false;
    }
    return true;
  };

  const goNext = (productId, draft) => {
    if (draft) localStorage.setItem('draft_product', JSON.stringify(draft));
    localStorage.setItem('current_product_id', String(productId));
    navigate("/product/image-upload", { state: { productId } });
  };

  const handleSubmit = async () => {
    if (submitting) return;
    if (!validate()) return;

    setSubmitting(true);
    try {
      const BASE = (process.env.REACT_APP_API_BASE_URL || "").replace(/\/$/, "");
      const token = localStorage.getItem('accessToken');

      // 백엔드로 보낼 페이로드 (컨트롤러 요구 필드 맞춤)
      const payload = {
        title: formData.title.trim(),
        category_id: toInt(formData.category_id),
        direct_store_id: toInt(formData.direct_store_id),
        status: "판매중",
        weight: toInt(formData.weight),
        price: toInt(formData.price),
        description: "",          // not null 대비
        intro: "",                // not null 대비
        is_video: false,
        video_url: null,
        created_at: new Date().toISOString(),
        returnable: Boolean(formData.returnable),
        regular_delivery: false,
        figma_export_url: null
      };

      // BASE 또는 token이 없으면 데모모드 폴백
      if (!BASE || !token) {
        const fakeId = Date.now();
        const draft = { product_id: fakeId, ...payload };
        goNext(fakeId, draft);
        return;
      }

      const res = await fetch(`${BASE}/api/s-products/basic`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      // 403(판매자 아님) 등 서버 에러 핸들링
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const message = errJson?.error || errJson?.message || `상품 등록 실패 (HTTP ${res.status})`;
        // 폴백: 시연용 로컬로 진행
        alert(`${message}\n시연 모드로 계속합니다.`);
        const fakeId = Date.now();
        const draft = { product_id: fakeId, ...payload };
        goNext(fakeId, draft);
        return;
      }

      const data = await res.json();
      const productId = data?.product?.product_id;
      if (!productId) {
        alert('등록 성공 응답에 product_id가 없습니다. 시연 모드로 계속합니다.');
        const fakeId = Date.now();
        const draft = { product_id: fakeId, ...payload };
        goNext(fakeId, draft);
        return;
      }

      // 정상 등록
      goNext(productId, { product_id: productId, ...payload });
    } catch (e) {
      console.error(e);
      alert('네트워크 오류가 발생했습니다. 시연 모드로 계속합니다.');
      const fakeId = Date.now();
      const draft = {
        product_id: fakeId,
        title: formData.title.trim(),
        category_id: toInt(formData.category_id),
        direct_store_id: toInt(formData.direct_store_id),
        status: "판매중",
        weight: toInt(formData.weight),
        price: toInt(formData.price),
        description: "",
        intro: "",
        is_video: false,
        video_url: null,
        created_at: new Date().toISOString(),
        returnable: Boolean(formData.returnable),
        regular_delivery: false,
        figma_export_url: null
      };
      goNext(fakeId, draft);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <p style={styles.subTitle}>기본 정보를 입력해주세요.</p>
      <div style={styles.card}>
        <label style={styles.label}>
          상품명
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            style={styles.input}
            placeholder="상품명을 입력하세요."
            required
          />
        </label>

        <label style={styles.label}>
          카테고리
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            style={styles.select}
            required
          >
            <option value="" disabled>카테고리를 선택하세요.</option>
            <option value="1">쌀,잡곡</option>
            <option value="2">채소,버섯</option>
            <option value="3">과일,견과</option>
            <option value="4">축산,축산가공</option>
            <option value="5">수산물</option>
            <option value="6">반찬,양념,가루</option>
            <option value="7">식사대용,간편식</option>
            <option value="8">간식,음료,유제품</option>
            <option value="9">식사대용,건강,차</option>
          </select>
        </label>

        <label style={styles.label}>
          용량
          <select
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            style={styles.select}
            required
          >
            <option value="" disabled>용량을 선택하세요.</option>
            <option value="500">500g</option>
            <option value="1000">1kg</option>
            <option value="2000">2kg</option>
          </select>
        </label>

        <label style={styles.label}>
          가격
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            style={styles.input}
            placeholder="가격을 입력하세요."
            min="0"
            required
          />
        </label>

        <label style={styles.label}>
          직매장
          <select
            name="direct_store_id"
            value={formData.direct_store_id}
            onChange={handleChange}
            style={styles.select}
            required
          >
            <option value="" disabled>직매장을 선택하세요.</option>
            <option value="1">로컬푸드 직매장</option>
            <option value="2">테스트 직매장</option>
            <option value="3">테스트 직매장</option>
          </select>
        </label>

        <div style={styles.label}>
          반품 가능 여부
          <div style={styles.radioGroup}>
            <label>
              <input
                type="radio"
                name="returnable"
                checked={formData.returnable === true}
                onChange={() => handleReturnable(true)}
              />
              <span style={styles.radioLabel}>반품 가능</span>
            </label>
            <label style={{ marginLeft: '24px' }}>
              <input
                type="radio"
                name="returnable"
                checked={formData.returnable === false}
                onChange={() => handleReturnable(false)}
              />
              <span style={styles.radioLabel}>반품 불가능</span>
            </label>
          </div>
        </div>
      </div>

      <div style={styles.buttonWrapper}>
        <button
          style={{ ...styles.nextButton, opacity: submitting ? 0.6 : 1 }}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? '등록 중…' : <>다음 단계로 이동 <span style={{ marginLeft: '6px' }}>➔</span></>}
        </button>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: { maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' },
  subTitle: { fontSize: '18px', fontWeight: '500', marginBottom: '20px' },
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    border: '1px solid #ccc',
    borderRadius: '16px',
    padding: '30px',
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: '#fff'
  },
  label: { display: 'flex', flexDirection: 'column', fontWeight: '500', fontSize: '14px' },
  input: {
    marginTop: '6px',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '14px'
  },
  select: {
    marginTop: '6px',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '14px'
  },
  radioGroup: { marginTop: '8px', display: 'flex', alignItems: 'center', fontSize: '14px' },
  radioLabel: { marginLeft: '6px', fontSize: '14px' },
  buttonWrapper: { display: 'flex', justifyContent: 'flex-end', maxWidth: '600px', margin: '20px auto 0' },
  nextButton: { backgroundColor: '#B6D19B', border: '1px solid black', borderRadius: '8px', padding: '12px 20px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' },
};

export default ProductFormPage;
