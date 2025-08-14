import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002/api';

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

  // 입력 변경 핸들러
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // 반품 가능 여부 전용
  const handleReturnable = (value) => {
    setFormData((prev) => ({ ...prev, returnable: value }));
  };

  // 간단 검증
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

  // 제출
  const handleSubmit = async () => {
    if (submitting) return;            // 중복 클릭 방지
    if (!validate()) return;

    try {
      setSubmitting(true);

      const payload = {
        title: formData.title.trim(),
        weight: toInt(formData.weight),
        category_id: toInt(formData.category_id),
        price: toInt(formData.price),
        direct_store_id: toInt(formData.direct_store_id),
        returnable: Boolean(formData.returnable),
      };

      const res = await axios.post(`${API_BASE}/s-products/basic`, payload, {
        withCredentials: true
      });

      console.log("상품 등록 성공:", res.data);

      const productId = res?.data?.product_id;
      if (!productId) {
        alert('상품 등록은 성공했지만 product_id가 응답에 없습니다. 백엔드 응답을 확인해주세요.');
        return;
      }

      // 새로고침 대비 저장(Optional)
      localStorage.setItem('current_product_id', String(productId));

      // 다음 단계로 product_id 전달
      navigate("/product/image-upload", { state: { productId } });
    } catch (error) {
      console.error("상품 등록 실패:", error.response?.data || error.message);
      const msg = error?.response?.data?.message || '상품 등록 실패';
      alert(msg);
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
            <option value="1">채소</option>
            <option value="2">과일</option>
            <option value="3">곡물</option>
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
            <option value="10">서울 직매장</option>
            <option value="11">경기 직매장</option>
            <option value="12">부산 직매장</option>
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
          {submitting ? '등록 중…' : <>다음 단계로 이동 &gt; <span style={{ marginLeft: '6px' }}>➔</span></>}
        </button>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  subTitle: {
    fontSize: '18px',
    fontWeight: '500',
    marginBottom: '20px',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    border: '1px solid #ccc',
    borderRadius: '16px',
    padding: '30px',
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: '#fff',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    fontWeight: '500',
    fontSize: '14px',
  },
  input: {
    marginTop: '6px',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '14px',
  },
  select: {
    marginTop: '6px',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '14px',
  },
  radioGroup: {
    marginTop: '8px',
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
  },
  radioLabel: {
    marginLeft: '6px',
    fontSize: '14px',
  },
  buttonWrapper: {
    display: 'flex',
    justifyContent: 'flex-end',
    maxWidth: '600px',
    margin: '20px auto 0',
  },
  nextButton: {
    backgroundColor: '#B6D19B',
    border: '1px solid black',
    borderRadius: '8px',
    padding: '12px 20px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px',
  },
};

export default ProductFormPage;
