import React, { useEffect, useState } from 'react';
import dummyQnA from '../../data/dummyQnA';

export default function ProductQnA({ productId }) {
    const [qnaList, setQnaList] = useState([]);

useEffect(() => {
    // 추후 fetch로 대체될 자리
    const filtered = dummyQnA.filter((qna) => qna.product_id === productId);
    setQnaList(filtered);
}, [productId]);

    const formatDate = (isoDate) => {
        const date = new Date(isoDate);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric', month: '2-digit', day: '2-digit'
        });
    };

    const formatStatus = (status) => {
        return status === 'ANSWERED' ? '답변완료' : '답변대기';
    };

    return (
        <div className="qna-container" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold' }}>상품 문의</h3>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
                상품에 대한 문의를 남기는 공간입니다. 배송, 교환/환불 문의는 1:1 문의를 이용해주세요.
            </p>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ borderBottom: '2px solid #ccc' }}>
            <tr>
                <th style={{ padding: '12px 10px', textAlign: 'left', width: '45%' }}>제목</th>
                <th style={{ padding: '12px 10px', textAlign: 'left', width: '20%' }}>작성자</th>
                <th style={{ padding: '12px 10px', textAlign: 'left', width: '20%' }}>작성일</th>
                <th style={{ padding: '12px 10px', textAlign: 'left', width: '15%' }}>답변상태</th>
            </tr>
            </thead>
            <tbody>
                {qnaList.length === 0 ? (
                    <tr>
                    <td colSpan="4" style={{ padding: '20px', textAlign: 'center' }}>등록된 문의가 없습니다.</td>
                    </tr>
                ) : (
                    qnaList.map((qna) => (
                    <tr key={qna.inquiry_id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px 10px', textAlign: 'left' }}>
                        {qna.is_visible === 'private' ? '🔒 비밀글입니다.' : qna.title}
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'left' }}>{qna.author}</td>
                        <td style={{ padding: '12px 10px', textAlign: 'left' }}>{formatDate(qna.created_at)}</td>
                        <td style={{
                            padding: '12px 10px',
                            textAlign: 'left',
                            color: qna.status === 'ANSWERED' ? 'black' : '#999'
                        }}>
                        {formatStatus(qna.status)}
                        </td>
                    </tr>
                    ))
                    )}
                </tbody>
            </table>

            <div style={{ textAlign: 'right', marginTop: '20px' }}>
                <button style={{
                    backgroundColor: '#02542D',
                    color: '#fff',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}>
                    문의하기
                </button>
            </div>
        </div>
    );
}
