import React, { useEffect, useState, useMemo } from 'react';
import {useNavigate} from 'react-router-dom';
import dummyQnA from '../../data/dummyQnA';

export default function ProductQnA({ productId }) {
  const [qnaList, setQnaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [source, setSource] = useState(''); // 'api' | 'dummy' | ''
  const navigate = useNavigate();
  // 더미를 현재 상품 ID로 스탬핑(없으면 inquiry_id/답글 id도 부여)
  const stampedDummy = useMemo(() => {
    const base = dummyQnA.filter(q => String(q.product_id) === String(productId));
    const src = base.length ? base : dummyQnA;
    return src.map((q, i) => ({
      ...q,
      product_id: Number(productId),
      inquiry_id: q.inquiry_id ?? i + 1,
      reply_count: q.reply_count ?? (q.replies?.length || 0),
      replies: (q.replies || []).map((r, j) => ({
        ...r,
        inquiry_reply_id: r.inquiry_reply_id ?? (i + 1) * 100 + (j + 1),
      })),
    }));
  }, [productId]);

  useEffect(() => {
    if (!productId) {
      setQnaList([]);
      setLoading(false);
      return;
    }

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
          console.warn(`QnA API 실패(${res.status}) → dummy 사용`);
          setQnaList(stampedDummy);
          setTotalPages(1);
          setSource('dummy');
          return;
        }

        const json = await res.json();
        // 응답 스키마 방어적으로 파싱
        const items =
          json?.data?.result ??
          json?.data?.items ??
          json?.result ??
          json?.items ??
          json?.rows ??
          json?.data ??
          [];

        if (!Array.isArray(items)) {
          // console.log('QnA API 비어있음 → dummy 사용');
          setQnaList(stampedDummy);
          setTotalPages(1);
          setSource('dummy');
        } else {
          setQnaList(items);
          setTotalPages(json?.data?.totalPages ?? json?.pagination?.total_pages ?? 1);
          setSource('api');
        }
      } catch (e) {
        console.error('QnA 네트워크 에러 → dummy 사용', e);
        setQnaList(stampedDummy);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchQnA();
  }, [productId, page, pageSize, stampedDummy]);

  const formatDate = (iso) =>
    iso ? new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '-';

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
              {/* 열이 5개라 colSpan도 5로 맞춰줘야 테이블 깨짐 방지 */}
              <td colSpan="5" style={{ padding: '20px', textAlign: 'center' }}>등록된 문의가 없습니다.</td>
            </tr>
          ) : (
            qnaList.map((qna) => (
              <tr key={qna.inquiry_id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px 10px', textAlign: 'left' }}>
                  {qna.is_visible === '비공개' ? '🔒 비밀글입니다.' : qna.title}
                </td>
                <td style={{ padding: '12px 10px', textAlign: 'left' }}>{qna.author_masked ?? '-'}</td>
                <td style={{ padding: '12px 10px', textAlign: 'left' }}>{formatDate(qna.created_at)}</td>
                <td
                  style={{
                    padding: '12px 10px',
                    textAlign: 'left',
                    whiteSpace: 'nowrap',
                    wordBreak: 'keep-all',
                    color: (qna.reply_count ?? 0) > 0 ? 'black' : '#999',
                  }}
                >
                  {(qna.reply_count ?? 0) > 0 ? '답변완료' : '답변대기'}
                </td>
                <td
                  style={{
                    padding: '12px 10px',
                    textAlign: 'left',
                    whiteSpace: 'nowrap',
                    wordBreak: 'keep-all',
                    color: (qna.reply_count ?? 0) > 0 ? 'black' : '#999',
                  }}
                >
                  ({qna.reply_count ?? 0})
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* 페이징 버튼 예시 (필요 없으면 제거) */}
      {totalPages > 1 && (
        <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>이전</button>
          <span>{page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>다음</button>
        </div>
      )}

      <div style={{ textAlign: 'right', marginTop: '20px' }}>
        <button
          style={{
            backgroundColor: '#02542D',
            color: '#fff',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
          onClick={() => navigate(`/mypage/inquiry?product_id=${productId}`)}
        >
          문의하기
        </button>
      </div>
    </div>
  );
}
