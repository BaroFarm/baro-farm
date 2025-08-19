import React, { useEffect, useState } from 'react';

export default function PickupModal({
  isOpen = true,
  onClose = () => {},
  onSelect = () => {},
  onSearch, // (params:{region:string, road:string, save:boolean}) => Promise<Store[]>
  results: initialResults = [], // 초기 리스트(옵션)
//   results = [
//     { id: 1, name: '직매장(농가) 명', distance: '~km', kiosk: true, hours: '바로 찾음 운영 시간', tel: '전화번호' },
//     { id: 2, name: '직매장(농가) 명', distance: '~km', kiosk: false, hours: '바로 찾음 운영 시간', tel: '전화번호' },
//     { id: 3, name: '직매장(농가) 명', distance: '~km', kiosk: true, hours: '바로 찾음 운영 시간', tel: '전화번호' },
//     { id: 4, name: '직매장(농가) 명', distance: '~km', kiosk: false, hours: '바로 찾음 운영 시간', tel: '전화번호' },
//   ],
//   onSelect = () => {},
}) {
  
  const [region, setRegion] = useState('');
  const [road, setRoad] = useState('');
  const [saveAddr, setSaveAddr] = useState(true);

  const [results, setResults] = useState(initialResults);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ESC로 닫기
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSearch = async () => {
    setError('');
    setLoading(true);
    try {
      if (onSearch) {
        const list = await onSearch({ region, road, save: saveAddr });
        setResults(Array.isArray(list) ? list : []);
      } else {
        // ⚠️ onSearch 미제공 시 간단 더미
        const dummy = [
          { id: 1, name: '성북 직매장', distance: '0.8km', distanceKm: 0.8, kiosk: true,  hours: '10:00~20:00', tel: '02-000-0000' },
          { id: 2, name: '종로 직매장', distance: '2.1km', distanceKm: 2.1, kiosk: false, hours: '09:00~18:00', tel: '02-111-1111' },
          { id: 3, name: '홍제 농가',   distance: '3.4km', distanceKm: 3.4, kiosk: true,  hours: '08:00~17:00', tel: '02-222-2222' },
        ];
        setResults(dummy.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999)));
      }
    } catch (e) {
      setError(e?.message || '검색 중 오류가 발생했습니다.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

    if (!isOpen) return null;
    
  return (
    // 바깥(오버레이) 클릭으로 닫기
    <div className="pm-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      {/* 내부 클릭은 전파 막기 */}
      <div className="pm-modal" onClick={(e) => e.stopPropagation()}>
        <button className="pm-close" aria-label="닫기" onClick={onClose}>×</button>

        <h2 className="pm-title">주소 찾기</h2>
        <p className="pm-sub">가까운 직매장을 찾아드려요</p>

        <div className="pm-form">
          <label className="pm-field" htmlFor="pm-region">
            <span className="pm-label">시/도</span>
            <input
              id="pm-region"
              className="pm-input"
              placeholder="예: 서울특별시"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            />
          </label>
          <label className="pm-field" htmlFor="pm-road">
            <span className="pm-label">도로명</span>
            <input
              id="pm-road"
              className="pm-input"
              placeholder="예: 세종대로 110"
              value={road}
              onChange={(e) => setRoad(e.target.value)}
            />
          </label>

          <label className="pm-save">
            <input
              type="checkbox"
              checked={saveAddr}
              onChange={(e) => setSaveAddr(e.target.checked)}
            />
            <div className="pm-save-text">
              <span>주소 저장</span>
              <small>다음 번에도 이 주소로 이용할게요</small>
            </div>
          </label>
        </div>

        <button className="pm-primary" onClick={handleSearch} disabled={loading}>
          {loading ? '찾는 중…' : '가까운 직매장 / 농가 찾기'}
        </button>

        {error && <div className="pm-error">{error}</div>}

        <ul className="pm-list">
          {results.length === 0 && !loading && (
            <li className="pm-empty">검색 결과가 없습니다. 주소를 입력하고 찾아보세요.</li>
          )}
          {results.map((r) => (
            <li key={r.id} className="pm-item">
              <div className="pm-thumb" aria-hidden />
              <div className="pm-info">
                <div className="pm-row-strong">{r.name}</div>
                <div className="pm-row">
                  거리 ({r.distance ?? (r.distanceKm != null ? `${r.distanceKm}km` : '알 수 없음')})
                  {r.kiosk && <span className="pm-dot">·</span>}
                  {r.kiosk && <span className="pm-tag">무인 수령함 사용 가능</span>}
                </div>
                <div className="pm-row">{r.hours}</div>
                <div className="pm-row">{r.tel}</div>
              </div>
              <button
                className="pm-select"
                onClick={() => onSelect(r)}
              >
                선택
              </button>
            </li>
          ))}
        </ul>

        <div className="pm-footer">
          <button className="pm-cancel" onClick={onClose}>취소</button>
        </div>
      </div>
    </div>
  );
}
