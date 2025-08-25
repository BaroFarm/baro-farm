import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const baseProducts = [
  { id: 1, name: '웅이네 양파 (1kg/10kg)', price: '9,200원~',
    description: `정성스럽게 키운 웅이네 양파입니다. 알맹이가 크고 튼실한 것이 특징입니다.\n직접 엄선한 최상품 양파! 산지 직송!`,
    imageUrl: '/images/onion.jpg',
  },
  { id: 2, name: '웅이네 당근 (1kg)', price: '8,700원',
    description: `정성스럽게 키운 웅이네 당근입니다. 알맹이가 크고 튼실한 것이 특징입니다.\n직접 엄선한 최상품 당근, 산지 직송!`,
    imageUrl: '/images/carrot.jpg',
  },
];

const initialProducts = Array.from({ length: 6 }, (_, i) => ({
  ...baseProducts[i % baseProducts.length],
  id: i + 1,
}));

function MyStorePage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState(initialProducts);

  const handleProductClick = (id) => navigate(`/product/${id}`);
  const handleDelete = (id) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <div style={styles.titleRow}>
          <h2 style={styles.title}>‘웅이네 채소’ 가게</h2>
          <button type="button" style={styles.edit}>✎ 스토어 이름 편집</button>
        </div>

        <div style={styles.productGrid}>
          {products.map((product) => (
            <div key={product.id} style={styles.cardWrapper}>
              <div style={styles.productCard} onClick={() => handleProductClick(product.id)}>
                <img src={product.imageUrl} alt={product.name} style={styles.image} />
              </div>

                        <div style={styles.nameRow}>
            <div style={styles.name} onClick={() => handleProductClick(product.id)}>
                {product.name}
            </div>
            <div style={styles.delete} onClick={() => handleDelete(product.id)}>
                ✕ <span>삭제하기</span>
            </div>
            </div>


              <p style={styles.description}>{product.description}</p>
              <p style={styles.price}>{product.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
  },
  container: {
    width: '100%',
    maxWidth: '1200px',
    padding: '30px',
    textAlign: 'left',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '12px',
    marginBottom: '20px',
  },
  title: {
    fontSize: '24px',   // 제목은 그대로
    margin: 0,
  },
  edit: {
    border: 'none',
    background: 'transparent',
    color: '#A8CFA3',
    fontSize: '14px',
    cursor: 'pointer',
    textDecoration: 'underline',
    padding: 0,
  },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    columnGap: '32px',
    rowGap: '56px',
    justifyItems: 'stretch',
  },
  cardWrapper: {
    width: '100%',
  },
  productCard: {
    width: '100%',
    aspectRatio: '16 / 9',
    overflow: 'hidden',
    cursor: 'pointer',
    border: '1px solid #ddd',
    borderRadius: '8px',
    background: '#fff',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  nameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '12px',
  },
  name: {
    fontSize: '25px',    // 🔥 상품명 크게,
    cursor: 'pointer',
  },
  delete: {
    fontSize: '14px',
    color: '#A8CFA3',
    textDecoration: 'underline',
    cursor: 'pointer',
  },
  description: {
    whiteSpace: 'pre-line',
    fontSize: '16px',    // 🔥 설명 크게
    margin: '12px 0',
    color: '#444',
    lineHeight: 1.5,
  },
  price: {
    fontWeight: 'bold',
    fontSize: '17px',    // 🔥 가격도 크게
  },
};



export default MyStorePage;
