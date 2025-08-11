import React from 'react';

function CouponCard({ image, discount, brand, description }) {
  return (
    <div style={styles.couponBox}>
      <div style={styles.couponContent}>
        <img src={image} alt={brand} style={styles.couponImage} />
        <div style={styles.couponInfo}>
          <div style={styles.discountRed}>{discount}</div>
          <div style={styles.brandText}><strong>{brand}&gt;</strong></div>
          <div>{description}</div>
        </div>
      </div>
      <div style={styles.couponSideBtn}>쿠폰 받기</div>
    </div>
  );
}

const styles = {
  couponBox: {
    display: 'flex',
    border: '1px solid #ccc',
    borderRadius: '6px',
    overflow: 'hidden',
    backgroundColor: '#fff',
    width: '300px',
    height: '80px',
  },
  couponContent: {
    display: 'flex',
    padding: '10px',
    flex: 1,
  },
  couponImage: {
    width: '50px',
    height: '50px',
    objectFit: 'cover',
    marginRight: '10px',
  },
  couponInfo: {
    fontSize: '13px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  discountRed: {
    color: 'red',
    fontSize: '12px',
    marginBottom: '4px',
  },
  brandText: {
    fontWeight: 'bold',
    fontSize: '14px',
    marginBottom: '2px',
  },
  couponSideBtn: {
    backgroundColor: '#dce5d3',
    padding: '0 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '14px',
    whiteSpace: 'nowrap',
  },
};

export default CouponCard;
