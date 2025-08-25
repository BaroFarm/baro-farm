// src/seller/SellerProductDetailPage.js
import React from 'react';
import CouponCard from './CouponCard';

const GREEN_LIGHT = '#A8CFA3';

export default function SellerProductDetailPage() {
  const handleEdit = () => alert('수정하기 기능은 추후 구현됩니다.');

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.pageTitle}>상품 상세</h2>
      <p style={styles.storeName}>‘웅이네 채소 가게’</p>

      <div style={styles.mainGrid}>
        {/* 좌측: 이미지 */}
        <div>
          <div style={styles.imageBox}>
            <img src="/images/onion.jpg" alt="상품 이미지" style={styles.image} />
            <button style={styles.editInImage} onClick={handleEdit}>✎ 수정하기</button>
          </div>
          <div style={styles.underImageRow}>
            <button style={styles.badgeDisabled}>반품 불가</button>
            <button style={styles.inlineEdit} onClick={handleEdit}>✎ 수정하기</button>
          </div>
        </div>

        {/* 우측: 상세 */}
        <div style={styles.right}>
          <h1 style={styles.productName}>
            웅이네 양파
            <button style={styles.inlineEdit} onClick={handleEdit}>✎ 수정하기</button>
            <span style={styles.variant}>(1kg/10kg)</span>
            <button style={styles.inlineEdit} onClick={handleEdit}>✎ 수정하기</button>
          </h1>

          <p style={styles.description}>
            정성스럽게 키운 웅이네 양파입니다. 알맹이가 크고 튼실한 것이 특징입니다.
            <br />
            직접 엄선한 최상품 양파, 산지 직송!
            <button style={styles.inlineEdit} onClick={handleEdit}>✎ 수정하기</button>
          </p>

          <div style={styles.priceRow}>
            <span style={styles.price}>9,200원~</span>
            <button style={styles.inlineEdit} onClick={handleEdit}>✎ 수정하기</button>
          </div>

          <div style={styles.starRow}>
            <span style={styles.stars}>⭐⭐⭐⭐⭐</span>
          </div>

          {/* 쿠폰 2개 가로 나열 */}
          <div style={styles.couponRow}>
            <div style={styles.couponItem}>
              <CouponCard
                image="/images/woongstore.jpg"
                discount="20% 할인"
                brand="웅이네"
                description="웅이네 채소"
              />
            </div>
            <div style={styles.couponItem}>
              <CouponCard
                image="/images/barofarm_logo.png"
                discount="전상품 10% 할인"
                brand="바로팜"
                description="바로팜"
              />
            </div>
          </div>

          {/* 하단 액션 */}
          <div style={styles.actionBar}>
            <button style={styles.wishBtn}>
              <img src="/images/barofarm_logo.png" alt="바로팜" style={styles.wishIcon} />
              찜하기
            </button>

            <div style={styles.rightActions}>
              <button style={styles.primaryBtn}>장바구니</button>
              <button style={styles.primaryBtn}>구매하기</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: { padding: '30px', maxWidth: 1200, margin: '0 auto', textAlign: 'left' },
  pageTitle: { fontSize: 24, margin: '0 0 8px 0' },
  storeName: { fontSize: 18, margin: '0 0 20px 0' },

  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1.4fr 1fr',
    gap: 36,
    alignItems: 'start',
  },

  imageBox: {
    position: 'relative',
    width: '100%',
    aspectRatio: '16 / 9',
    border: '1px solid #ddd',
    borderRadius: 8,
    overflow: 'hidden',
    background: '#fff',
  },
  image: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  editInImage: {
    position: 'absolute', bottom: 10, right: 10,
    background: 'transparent', border: 'none', color: '#fff',
    textShadow: '1px 1px 2px rgba(0,0,0,.85)', fontSize: 14, cursor: 'pointer',
  },

  underImageRow: { display: 'flex', gap: 10, alignItems: 'center', marginTop: 12 },
  badgeDisabled: {
    padding: '8px 14px',
    borderRadius: 999,
    border: 'none',
    background: '#E6E6E6',
    color: '#333',
    cursor: 'not-allowed',
  },

  right: { minWidth: 0 },

  productName: {
    fontSize: 30,
    fontWeight: 800,
    margin: '0 0 10px 0',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  variant: { fontWeight: 800 },

  description: {
    fontSize: 16,
    color: '#333',
    whiteSpace: 'pre-line',
    lineHeight: 1.6,
    margin: '6px 0 8px 0',
  },

  priceRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
  price: { fontSize: 28, fontWeight: 400 },

  starRow: { display: 'flex', justifyContent: 'flex-end', margin: '6px 0 14px 0' },
  stars: { fontSize: 32, color: '#FFD700' },

  // ▼ 쿠폰을 가로 1줄로 고정
  couponRow: {
    display: 'flex',
    gap: 16,
    flexWrap: 'nowrap',
    alignItems: 'stretch',
    marginBottom: 18,
  },
  // 각 쿠폰을 동일 폭으로
  couponItem: { flex: '1 1 0' },

  actionBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    marginTop: 6,
  },

  wishBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E9F6E2',
    padding: '12px 18px',
    border: '1px solid #8DC06C',
    borderRadius: 999,
    cursor: 'pointer',
    fontSize: 18,
  },
  wishIcon: { width: 22, height: 22, objectFit: 'contain' },

  rightActions: { display: 'flex', gap: 12, flexShrink: 0 },

  // ▼ 두 버튼 동일 스타일(이미지처럼 연한 초록 필)
  primaryBtn: {
    backgroundColor: '#C8DEA9', // 둘 다 동일 색
    color: '#222',
    padding: '12px 28px',
    border: 'none',
    borderRadius: 999,
    cursor: 'pointer',
    fontSize: 18,
    fontWeight: 700,
    minWidth: 140,
  },

  inlineEdit: {
    background: 'transparent',
    border: 'none',
    color: GREEN_LIGHT,
    cursor: 'pointer',
    fontSize: 14,
    textDecoration: 'underline',
  },
};
