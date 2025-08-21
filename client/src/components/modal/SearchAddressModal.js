import React, { useEffect, useMemo, useState } from 'react';
import './SearchAddressModal.css'; // ← 외부 CSS로 이동

export default function SearchAddressModal({
    isOpen = false,
    onClose = () => {},
    onSearch,
    onSelect = () => {},
    initialResults,
    defaultCity = '',
    defaultRoad = '',
    defaultPage = 1,
    defaultLimit = 10,
}) {
    const [city, setCity]   = useState(defaultCity);
    const [road, setRoad]   = useState(defaultRoad);
    const [page, setPage]   = useState(defaultPage);
    const [limit, setLimit] = useState(defaultLimit);

    const [results, setResults] = useState(() => initialResults ?? []);
    const [total, setTotal]     = useState(0);
    const [loading, setLoading] = useState(false);
    const [err, setErr]         = useState('');

    useEffect(() => {
        if (!isOpen) return;
        setCity(defaultCity);
        setRoad(defaultRoad);
        setPage(defaultPage);
        setLimit(defaultLimit);
        setResults(initialResults ?? []);
        setTotal(0);
        setErr('');
    }, [isOpen, defaultCity, defaultRoad, defaultPage, defaultLimit, initialResults]);

    const canSearch = city.trim() !== '' && road.trim() !== '';
    const totalPages = useMemo(
        () => (!total || !limit ? 0 : Math.ceil(total / limit)),
        [total, limit]
    );

    const handleSearch = async () => {
        setErr('');
        setLoading(true);
        try {
            let list = [];
            let totalCount = 0;

            if (onSearch) {
                const r = await onSearch({ city, road, page, limit });
                if (Array.isArray(r)) {
                    list = r;
                } else {
                    list = Array.isArray(r?.results) ? r.results : [];
                    totalCount = Number(r?.total || 0);
                }
            } else {
                const BASE = (process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_URL || '').replace(/\/$/, '');
                const q = new URLSearchParams({ city, road, page: String(page), limit: String(limit) });
                const res = await fetch(`${BASE ? `${BASE}` : ''}/api/address/search?${q}`, {
                    headers: { 'Content-Type': 'application/json' },
                });
                if (!res.ok) throw new Error('주소 검색 실패');
                const json = await res.json();
                list = json?.results ?? [];
                totalCount = Number(json?.pagination?.total || 0);
            }

            setResults(list);
            setTotal(totalCount);
        } catch (e) {
            setResults([]);
            setErr(e?.message || '검색 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
        className="sa-overlay"
        role="dialog"
        aria-modal="true"
        onClick={(e) => { if (e.currentTarget === e.target) onClose(); }}
        >
        <div className="sa-modal" onClick={(e) => e.stopPropagation()}>
            <button className="sa-close" aria-label="닫기" onClick={onClose}>×</button>

            <h2 className="sa-title">주소 찾기</h2>
            <p className="sa-sub">가까운 직매장을 찾아드려요</p>

            <form className="sa-form" onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
            <label className="sa-field" htmlFor="sa-city">
                <span className="sa-label">시/도</span>
                <input id="sa-city" className="sa-input" placeholder="예: 서울특별시"
                    value={city} onChange={(e) => { setCity(e.target.value); setPage(1); }} />
            </label>

            <label className="sa-field" htmlFor="sa-road">
                <span className="sa-label">도로명</span>
                <input id="sa-road" className="sa-input" placeholder="예: 세종대로 110"
                    value={road} onChange={(e) => { setRoad(e.target.value); setPage(1); }} />
            </label>

            <button type="submit" className="sa-primary" disabled={loading || !canSearch}>
                {loading ? '찾는 중…' : '확인'}
            </button>
        </form>

        {err && <div className="sa-error">{err}</div>}

        <div className="sa-table">
            <div className="sa-thead">
                <div className="sa-th">우편번호</div>
                <div className="sa-th">도로명</div>
                <div className="sa-th">지번</div>
                <div className="sa-th ta-right">선택</div>
            </div>

            <div className="sa-tbody">
                {(!results || results.length === 0) ? (
                    <div className="sa-empty">검색 결과가 없습니다.</div>
                ) : (
                    results.map((r, idx) => (
                        <div className="sa-tr" key={`${r.postcode}-${idx}`}>
                            <div className="sa-td">{r.postcode}</div>
                            <div className="sa-td">{r.road}</div>
                            <div className="sa-td">{r.jibun || '-'}</div>
                            <div className="sa-td ta-right">
                            <button className="sa-select" onClick={() => onSelect(r)}>선택</button>
                        </div>
                    </div>
                ))
            )}
        </div>

        {totalPages > 0 && (
            <div className="sa-foot">
                <div>총 {total.toLocaleString()}건 / {page} / {totalPages}페이지</div>
                <div className="sa-pager">
                    <button className="sa-pagebtn" disabled={page <= 1 || loading} onClick={() => setPage(p => Math.max(1, p - 1))}>이전</button>
                    <button className="sa-pagebtn" disabled={page >= totalPages || loading} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>다음</button>
                </div>
            </div>
        )}
        </div>

        <div className="sa-footer">
            <button className="sa-cancel" onClick={onClose}>취소</button>
        </div>
        </div>
    </div>
    );
}
