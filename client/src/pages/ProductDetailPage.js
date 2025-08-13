// ProductDetailPage.js
import React, { useState } from 'react';
import CouponCard from './CouponCard';
import ReturnPolicyModal from '../components/ReturnPolicyModal';

function ProductDetailPage() {
  const [showModal, setShowModal] = useState(false);

  const handleEdit = () => {
    alert('수정하기 기능은 추후 구현됩니다.');
  };

  const handleReturnEdit = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.title}>상품 상세</h2>
      <p style={styles.storeName}>‘웅이네 채소 가게’</p>

      <div style={styles.main}>
        {/* 왼쪽: 이미지 영역 */}
        <div style={styles.left}>
          <div style={styles.imageBox}>
            <img
              src="/images/onion.jpg"
              alt="상품 이미지"
              style={styles.image}
            />
            <button style={styles.editButton} onClick={handleEdit}>✎ 수정하기</button>
          </div>
        </div>

        {/* 오른쪽: 상품 설명 영역 */}
        <div style={styles.right}>
          <h3 style={styles.productName}>
            웅이네 양파{' '}
            <button style={styles.inlineEdit} onClick={handleEdit}>✎ 수정하기</button>
          </h3>
          <p style={styles.description}>
            정성스럽게 키운 웅이네 양파입니다. 알맹이가 크고 튼실한 것이 특징입니다.
            <br />
            직접 엄선한 최상품 양파! 산지 직송!
            <button style={styles.inlineEdit} onClick={handleEdit}>✎ 수정하기</button>
          </p>
          <p style={styles.price}>
            9,200원{' '}
            <button style={styles.inlineEdit} onClick={handleEdit}>✎ 수정하기</button>
          </p>

          <div style={styles.stars}>⭐⭐⭐⭐⭐</div>

          <div style={styles.couponContainer}>
            <CouponCard
              image="/images/woongstore.jpg"
              discount="20% 할인"
              brand="웅이네"
              description="웅이네 채소"
            />
            <CouponCard
              image="/images/barofarm_logo.png"
              discount="전상품 10% 할인"
              brand="바로팜"
              description="바로팜"
            />
          </div>

          <div style={styles.actionButtons}>
            <button style={styles.wishBtn}>찜하기</button>
            <button style={styles.cartBtn}>장바구니</button>
            <button style={styles.buyBtn}>구매하기</button>
          </div>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div style={styles.bottom}>
        <button style={styles.disabledBtn}>반품 불가</button>
        <button style={styles.inlineEdit} onClick={handleReturnEdit}>
          ✎ 수정하기
        </button>
      </div>

      {showModal && <ReturnPolicyModal onClose={handleCloseModal} />}
    </div>
  );
}

const styles = {
  wrapper: { padding: '30px', maxWidth: '1200px', margin: '0 auto' },
  title: { fontSize: '24px', marginBottom: '10px' },
  storeName: { fontSize: '18px', marginBottom: '20px' },
  main: { display: 'flex', gap: '40px' },
  left: { flex: '1' },
  imageBox: {
    position: 'relative', width: '100%', aspectRatio: '1 / 1',
    borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd',
  },
  image: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  editButton: {
    position: 'absolute', bottom: '10px', right: '10px',
    background: 'transparent', border: 'none', color: 'white',
    textShadow: '1px 1px 2px black', fontSize: '14px', cursor: 'pointer',
  },
  right: { flex: '1' },
  productName: { fontSize: '22px', marginBottom: '10px' },
  description: { fontSize: '16px', whiteSpace: 'pre-line', marginBottom: '10px' },
  price: { fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' },
  stars: { fontSize: '20px', color: '#FFD700', marginBottom: '20px' },
  couponContainer: { display: 'flex', gap: '20px', marginBottom: '20px' },
  actionButtons: { display: 'flex', gap: '10px' },
  wishBtn: {
    backgroundColor: '#E9F6E2', padding: '10px 20px',
    border: '1px solid #8DC06C', borderRadius: '6px', cursor: 'pointer',
  },
  cartBtn: {
    backgroundColor: '#DFF0D8', padding: '10px 20px',
    border: '1px solid #8DC06C', borderRadius: '6px', cursor: 'pointer',
  },
  buyBtn: {
    backgroundColor: '#8DC06C', color: 'white',
    padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer',
  },
  bottom: {
    marginTop: '30px', display: 'flex', alignItems: 'center', gap: '10px',
  },
  disabledBtn: {
    backgroundColor: '#ccc', padding: '8px 16px',
    border: 'none', borderRadius: '4px', cursor: 'not-allowed',
  },
  inlineEdit: {
    background: 'transparent', border: 'none', color: '#8DC06C',
    cursor: 'pointer', fontSize: '14px', textDecoration: 'underline', marginLeft: '8px',
  },
};

export default ProductDetailPage;
