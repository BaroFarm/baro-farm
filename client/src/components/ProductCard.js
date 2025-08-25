// src/components/ProductCard.jsx
import React from 'react';

function ProductCard({ product }) {
  return (
    <div style={styles.card}>
      <div style={styles.imageBox}>이미지</div>
      <div style={styles.name}>{product.name}</div>
      <div style={styles.price}>{product.price}원</div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: '#f8f8f8',
    border: '1px solid #ddd',
    borderRadius: '6px',
    padding: '12px',
    textAlign: 'center',
    fontSize: '14px',
  },
  imageBox: {
    backgroundColor: '#ccc',
    height: '80px',
    marginBottom: '8px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontWeight: '500',
    marginBottom: '4px',
  },
  price: {
    color: '#888',
    fontSize: '13px',
  },
};

export default ProductCard;