import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 

function ProductFormPage() {
  const [isReturnable, setIsReturnable] = useState(false);
  const navigate = useNavigate();


  return (
    <div style={styles.pageWrapper}>
      <p style={styles.subTitle}>기본 정보를 입력해주세요.</p>

      <div style={styles.card}>
        <label style={styles.label}>
          상품명
          <input style={styles.input} placeholder="상품명을 입력하세요." />
        </label>

        <label style={styles.label}>
          카테고리
          <select style={styles.select}>
            <option disabled selected>카테고리를 선택하세요.</option>
            <option>채소</option>
            <option>과일</option>
            <option>곡물</option>
          </select>
        </label>

        <label style={styles.label}>
          용량
          <select style={styles.select}>
            <option disabled selected>용량을 선택하세요.</option>
            <option>500g</option>
            <option>1kg</option>
            <option>2kg</option>
          </select>
        </label>

        <label style={styles.label}>
          가격
          <input style={styles.input} placeholder="가격을 입력하세요." />
        </label>

        <label style={styles.label}>
          직매장
          <select style={styles.select}>
            <option disabled selected>직매장을 선택하세요.</option>
            <option>서울 직매장</option>
            <option>경기 직매장</option>
            <option>부산 직매장</option>
          </select>
        </label>

        <div style={styles.label}>
          반품 가능 여부
          <div style={styles.radioGroup}>
            <label>
              <input
                type="radio"
                name="returnable"
                value="yes"
                checked={isReturnable}
                onChange={() => setIsReturnable(true)}
              />
              <span style={styles.radioLabel}>반품 가능</span>
            </label>
            <label style={{ marginLeft: '24px' }}>
              <input
                type="radio"
                name="returnable"
                value="no"
                checked={!isReturnable}
                onChange={() => setIsReturnable(false)}
              />
              <span style={styles.radioLabel}>반품 불가능</span>
            </label>
          </div>
        </div>

        {isReturnable && (
          <label style={styles.label}>
            반품 가능 조건
            <input style={styles.input} placeholder="반품 가능 조건을 입력하세요." />
          </label>
        )}
      </div>

      <p style={styles.notice}>※ 반품 가능에 체크하면 아래 조건 입력창 뜨도록</p>

      <div style={styles.buttonWrapper}>

        <button style={styles.nextButton} onClick={() => navigate('/product/image-upload')}>
  다음 단계로 이동 &gt; <span style={{ marginLeft: '6px' }}>➔</span>
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
  notice: {
    color: 'red',
    fontSize: '13px',
    margin: '12px auto 0',
    maxWidth: '600px',
    paddingLeft: '6px',
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
