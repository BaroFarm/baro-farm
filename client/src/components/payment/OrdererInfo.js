import React from 'react';

export default function OrdererInfo() {
    return (
        <>
        <div style={{
            backgroundColor: '#f9faf8',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '24px'
        }}>
            {/* 주문자명 줄 전체 */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px'
            }}>
                {/* 왼쪽: 라벨 + 입력 + 기본 배송지 버튼 */}
                <div style={{ display: 'flex', alignItems: 'center', flex: 1, marginRight: '12px' }}>
                    <label style={{ width: '100px', fontWeight: 'bold' }}>주문자 명</label>
                    <input
                        type="text"
                        value="홍길동"
                        readOnly
                        style={{ width: '200px', padding: '6px', marginRight: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                    <button
                        style={{
                            backgroundColor: '#b6c8a8',
                            border: 'none',
                            borderRadius: '20px',
                            padding: '6px 12px',
                            fontWeight: 'bold',
                            cursor: 'default',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        기본 배송지
                    </button>
                </div>

                {/* 오른쪽: 변경 버튼 */}
                <button
                    style={{
                        backgroundColor: '#B6D19B',
                        border: 'none',
                        borderRadius: '20px',
                        padding: '6px 16px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                    }}
                >
                    변경
                </button>
            </div>

            {/* 주소 */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <label style={{ width: '100px', fontWeight: 'bold' }}>주소</label>
                <input
                    type="text"
                    value="서울특별시 도봉구 우이천로 381, ○○○동 ○○○호"
                    readOnly
                    style={{ width: '400px', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
            </div>

            {/* 전화번호 */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ width: '100px', fontWeight: 'bold' }}>전화번호</label>
                <input
                    type="text"
                    value="010-0000-0000"
                    readOnly
                    style={{ width: '400px', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
            </div>
        </div>
        
        {/* 배송 메모 */}
        <div style={{
            backgroundColor: '#f9faf8',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '24px',
        }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ width: '100px', fontWeight: 'bold' }}>배송 메모</label>
                <input
                    type="textArea"
                    style={{ width: '400px', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
            </div>
        </div>
    </>
    );
}
