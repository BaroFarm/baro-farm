import React, {useState, useEffect} from 'react';
import ProductReviewItem from '../common/product/ProductReviewItem';

export default function ProductReviewList({productId}){
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visibleCount, setVisibleCount] = useState(5); //처음에 5개만 보이도록

    useEffect(() => {
        const fetchReview = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/products/${productId}/reviews`);
                const json = await res.json();
                setReviews(json.reviews);
            } catch (err) {
                console.error('리뷰를 불러오지 못했습니다. 예시 데이터를 사용합니다.', err);
                setReviews([
                    {user_id: "farm****", date: "2025-07-04", rating: 5, content: "배송도 빠르고 좋아요!!",},
                    {user_id: "farm****", date: "2025-07-04", rating: 3, content: "그냥 사과에요", },
                    {user_id: "farm****", date: "2025-07-04", rating: 5, content: "그냥 사과에요", },
                    {user_id: "farm****", date: "2025-07-04", rating: 4, content: "그냥 사과에요", },
                    {user_id: "farm****", date: "2025-07-04", rating: 3, content: "그냥 사과에요", },
                    {user_id: "farm****", date: "2025-07-04", rating: 3, content: "그냥 사과에요", },
                    {user_id: "farm****", date: "2025-07-04", rating: 1, content: "그냥 사과에요", },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchReview();
    }, [productId]);

    const handleShowMore = () => {
        setVisibleCount(prev => prev + 5); //더보기 클릭 시 5개 더 보기
    };

    if (loading) return <p style={{ padding: '24px' }}>리뷰를 불러오는 중...</p>;

    return (
        <div style={{ padding: '24px' }}>
            <h3 style={{ margin: '30px 0 30px 0', fontSize: '18px', textAlign: 'left' }}>리뷰 ({reviews.length})</h3>
            {reviews.length === 0 ? (
                <p>아직 작성된 후기가 없습니다.</p>
            ) : (
                <>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {reviews.slice(0, visibleCount).map((review, idx) => (
                            <ProductReviewItem key={idx} review={review} />
                        ))}
                </ul>
                {visibleCount < reviews.length && (
                        <button
                            onClick={handleShowMore}
                            style={{
                                marginTop: '16px',
                                padding: '10px 20px',
                                background: 'none',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '16px'
                            }}
                        >
                            더보기
                        </button>
                    )}
                </>
            )}
        </div>
    );
}