import React, { useEffect, useState } from 'react';
import dummyQnA from '../../data/dummyQnA';

export default function ProductQnA({ productId }) {
    const [qnaList, setQnaList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState(null);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

useEffect(() => {
    const fetchQnA = async () => {
        try {
            setLoading(true);
            setErr(null);

            const accessToken = localStorage.getItem('accessToken');
            const res = await fetch(
                `${process.env.REACT_APP_API_BASE_URL}/api/products/${productId}/inquiries?page=${page}&pageSize=${pageSize}`,
            {
                headers: {
                'Content-Type': 'application/json',
                ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                },
            }
            );

            if (!res.ok) {
        // 오늘은 API 실패하면 그냥 dummy 데이터 보여주기
        console.warn(`API 호출 실패(${res.status}), dummy 데이터 사용`);
        setQnaList(dummyQnA);
        setTotalPages(1);
        setLoading(false);
        return;
      }

      const json = await res.json();
      const items = json?.data?.result ?? [];
      setQnaList(items);
      setTotalPages(json?.data?.totalPages ?? 1);
    } catch (e) {
      console.error(e);
      // 네트워크 에러도 dummy로
      setQnaList(dummyQnA);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  if (productId) fetchQnA();
}, [productId, page, pageSize]);

    const formatDate = (iso) =>
        new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });

    const formatStatus = (replyCount) => (replyCount > 0 ? '답변완료' : '답변대기');

    if (loading) return <div style={{ padding: 20 }}>상품 문의 불러오는 중...</div>;
    if (err) return <div style={{ padding: 20, color: 'crimson' }}>{err}</div>;



    return (
        <div className="qna-container" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold' }}>상품 문의</h3>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
                상품에 대한 문의를 남기는 공간입니다. 배송, 교환/환불 문의는 1:1 문의를 이용해주세요.
            </p>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ borderBottom: '2px solid #ccc' }}>
            <tr>
                <th style={{ padding: '12px 10px', textAlign: 'left', width: '40%' }}>제목</th>
                <th style={{ padding: '12px 10px', textAlign: 'left', width: '20%' }}>작성자</th>
                <th style={{ padding: '12px 10px', textAlign: 'left', width: '20%' }}>작성일</th>
                <th style={{ padding: '12px 10px', textAlign: 'left', width: '15%' }}>답변상태</th>
                <th style={{ padding: '12px 10px', textAlign: 'left', width: '15%' }}>댓글</th>

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
                            {qna.is_visible === '비공개' ? '🔒 비밀글입니다.' : qna.title}
                        </td>
                        <td style={{ padding: '12px 10px', textAlign: 'left' }}>{qna.author_masked}</td>
                        <td style={{ padding: '12px 10px', textAlign: 'left' }}>{formatDate(qna.created_at)}</td>
                        {/* ✅ 답변상태: 이 칸만 남기기 */}
                        <td style={{
                            padding: '12px 10px',
                            textAlign: 'left',
                            whiteSpace: 'nowrap',        // 줄바꿈 방지
                            wordBreak: 'keep-all',       // 한국어 단어 쪼개짐 방지
                            color: (qna.reply_count ?? 0) > 0 ? 'black' : '#999',
                        }}>
                            {(qna.reply_count ?? 0) > 0 ? '답변완료' : '답변대기'}
                        </td>
                        <td
                            style={{
                            padding: '12px 10px',
                            textAlign: 'left',
                            whiteSpace: 'nowrap',   // 줄바꿈 방지
                            wordBreak: 'keep-all',  // 한국어 단어 쪼개짐 방지
                            color: (qna.reply_count ?? 0) > 0 ? 'black' : '#999',
                        }}
                        >
                            {(qna.reply_count ?? 0) > 0
                                ? `(${qna.reply_count})`
                                : `(${qna.reply_count ?? 0})`}
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
