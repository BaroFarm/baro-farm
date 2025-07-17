import React, {useState} from 'react';
import ProductCard from './ProductCard';

export default function ProductSlider({products=[], title=""}){
    const [currentIndex, setCurrentIndex] = useState(0);
    const itemsPerPage = 5;

    const nextSlide = () => {
        if (currentIndex + itemsPerPage < products.length){
            setCurrentIndex(currentIndex + itemsPerPage);
        }
    };
    const prevSlide = () => {
        setCurrentIndex(Math.max(currentIndex - itemsPerPage, 0));
    };
    const visibleProducts = products.slice(currentIndex, currentIndex + itemsPerPage);

    return (
        <div className="w-full px-4">
            <h2 className="text-xl font-bold mb-4" style={{ textAlign: "left" }}>
                {title}
            </h2>
            <div style={{ display: "flex", alignItems: "center" }}>
                <button onClick={prevSlide} disabled={currentIndex === 0}>
                    ◀
                </button>
                <div
                    style={{
                    display: "flex",
                    gap: "10px",
                    overflow: "hidden",
                    flex: "1",
                    margin: "0 10px",
                    }}
                >
                    {visibleProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
                <button
                    onClick={nextSlide}
                    disabled={currentIndex + itemsPerPage >= products.length}
                >
                    ▶
                </button>
            </div>
        </div>
    );
}
