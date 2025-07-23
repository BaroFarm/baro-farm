// src/components/ProductSection.jsx
import React from 'react';
import ProductCard from './ProductCard'; // 이제 이걸 사용해야 함

function ProductSection({ title }) {
  const dummyProducts = new Array(8).fill(null);

  return (
    <section style={styles.section}>
      <h2 style={styles.title}>{title}</h2>
      <div style={styles.grid}>
        {dummyProducts.map((_, index) => (
          <ProductCard
            key={index}
            product={{
              name: `${title} ${index + 1}`,
              price: (index + 1) * 1000,
            }}
          />
        ))}
      </div>
    </section>
  );
}

const styles = {
  section: {
    marginBottom: '40px',
  },
  title: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '12px',
    paddingLeft: '8px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: '12px',
  },
};

export default ProductSection;
