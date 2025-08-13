import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. 더미 상품 데이터
const baseProducts = [
  {
    id: 1,
    name: '웅이네 양파 (1kg/10kg)',
    price: '9,200원~',
    description: `정성스럽게 키운 웅이네 양파입니다. 알맹이가 크고 튼실한 것이 특징입니다.\n직접 엄선한 최상품 양파! 산지 직송!`,
    imageUrl: '/images/onion.jpg',
  },
  {
    id: 2,
    name: '웅이네 당근 (1kg)',
    price: '8,700원',
    description: `정성스럽게 키운 웅이네 당근입니다. 알맹이가 크고 튼실한 것이 특징입니다.\n직접 엄선한 최상품 당근, 산지 직송!`,
    imageUrl: '/images/carrot.jpg',
  },
];

const initialProducts = Array.from({ length: 6 }, (_, i) => ({
  ...baseProducts[i % baseProducts.length],
  id: i + 1,
}));

// 2. 컴포넌트
function MyStorePage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState(initialProducts);

  const handleProductClick = (id) => {
    navigate(`/product/${id}`);
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm('정말 삭제하시겠습니까?');
    if (confirmDelete) {
      setProducts((prev) => prev.filter((product) => product.id !== id));
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h2 style={styles.title}>
          ‘웅이네 채소’ 가게 <span style={styles.edit}>✎ 스토어 이름 편집</span>
        </h2>
        <div style={styles.productGrid}>
          {products.map((product) => (
            <div key={product.id} style={styles.cardWrapper}>
              <div
                style={styles.productCard}
                onClick={() => handleProductClick(product.id)}
              >
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  style={styles.image}
                />
              </div>

              <div style={styles.rowBetween}>
                <div
                  style={styles.name}
                  onClick={() => handleProductClick(product.id)}
                >
                  {product.name}
                </div>
                <div
                  style={styles.delete}
                  onClick={() => handleDelete(product.id)}
                >
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

// 3. 스타일
const styles = {
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
  },
  container: {
    width: '100%',
    maxWidth: '1200px',
    padding: '30px',
  },
  title: {
    fontSize: '24px',
    marginBottom: '20px',
  },
  edit: {
    color: '#8DC06C',
    fontSize: '14px',
    marginLeft: '10px',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  productGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '40px',
    justifyContent: 'center',
  },
  cardWrapper: {
    width: '300px',
  },
  productCard: {
    width: '100%',
    aspectRatio: '1 / 1',
    overflow: 'hidden',
    cursor: 'pointer',
    border: '1px solid #ddd',
    borderRadius: '8px',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  rowBetween: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '10px',
  },
  name: {
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  delete: {
    fontSize: '14px',
    color: '#8DC06C',
    textDecoration: 'underline',
    cursor: 'pointer',
  },
  description: {
    whiteSpace: 'pre-line',
    fontSize: '14px',
    margin: '10px 0',
  },
  price: {
    fontWeight: 'bold',
  },
};

export default MyStorePage;
