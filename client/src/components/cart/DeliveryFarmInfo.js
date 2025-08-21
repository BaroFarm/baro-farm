import React from 'react';

export default function DeliveryFarmInfo({ farmName, estimatedTime, arrivalTime, imageUrl }) {
    return (
        <div style={{ padding: '16px 0', borderBottom: '1px solid #cce4c1' }}>
            <div style={{ fontSize: '14px', marginBottom: '8px' }}>배송 직매장(농가)</div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{
                    width: '60px',
                    height: '60px',
                    backgroundColor: '#ddd',
                    borderRadius: '4px',
                    backgroundImage: `url(${imageUrl || ''})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontWeight: 'bold' }}>{farmName}</div>
                    <div style={{ fontSize: '14px', color: '#555' }}>
                        배송 예상 시간: {estimatedTime}분 ({arrivalTime} 도착)
                    </div>
                </div>
            </div>
        </div>
    );
}
