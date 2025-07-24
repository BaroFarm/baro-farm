import React from 'react';

export default function ProductReviewItem({ review }) {
    const starts = '⭐'.repeat(Math.round(review.rating));

    return (
        <div style={{flex: 1,}}>
            <li style={{
                borderBottom: '1px solid #ddd', 
                padding: '16px 0',
                display: 'flex',
                gap: '12px',
                alignItmes: 'flex-start',
            }}>
                <img
                    src={review.image_url}
                    alt= "이미지"
                    style={{ width: 120, height: 70,
                            objectFit: 'cover', border: '1px solid gray', }}
                />
                <div style={{
                    flex: 1, display: 'flex', flexDirection: 'column', gap: '4px'
                }}>
                    <div style={{
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'center',
                    }}>
                        <p style={{ fontWeight: 'bold', lineHeight: '1.2'}}>{review.user_id}</p>
                        <p>{starts}</p>
                    </div>
                    <p style={{ fontSize: '13px', color: '#999', margin: 0, lineHeight: '1.2', textAlign: 'left'}}>
                        {review.date}</p>
                    <p style={{ fontSize: '15px', margin: 0, lineHeight: '1.4', textAlign: 'left' }}>{review.content}</p>
                </div>
            </li>
        </div>
    );
}
