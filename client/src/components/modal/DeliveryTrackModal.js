import React from "react";
import {
  FaShoppingBag,   // 주문 확인
  FaBoxOpen,       // 상품 준비
  FaTruck,         // 배송 중
  FaHome,          // 배송 완료
} from "react-icons/fa";

export default function DeliveryTrackModal({
    open,
    onClose,
    carrierName = "CJ 대한통운",
    trackingNumber = "12345678910",
    carrierPhone = "1111-2222",
    // 0: 주문 확인, 1: 상품 준비, 2: 배송 중, 3: 배송 완료
    currentStep = 2,
    // 타임라인(최신이 위로 오게 정렬해서 넣어도 되고, 아래에서 정렬)
    events = [
        { time: "2025-08-23 11:41", location: "이천 로컬 직매장", status: "상품 배송 시작" },
        { time: "2025-08-23 11:23", location: "이천 로컬 직매장", status: "주문 정보 확인" },
    ],
    address = "12345 서울특별시 강남구 테헤란로 101호",
}) {
    if (!open) return null;

    const steps = [
        { key: "ORDERED",     label: "주문 확인",  Icon: FaShoppingBag },
        { key: "READY",       label: "상품 준비",  Icon: FaBoxOpen },
        { key: "IN_DELIVERY", label: "배송 중",    Icon: FaTruck },
        { key: "DELIVERED",   label: "배송 완료",  Icon: FaHome },
    ];

    const copy = async (text) => {
        try { await navigator.clipboard.writeText(text); alert("복사되었습니다."); }
        catch { alert("복사 실패. 직접 복사해주세요."); }
    };

    const linePct = (currentStep / (steps.length - 1)) * 100;

    return (
    <div style={S.backdrop} onClick={onClose} role="dialog" aria-modal="true">
        <div style={S.sheet} onClick={(e) => e.stopPropagation()}>
            {/* 헤더 */}
            <div style={S.header}>
                <div style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 10 }}>배송 조회</div>
                    <button aria-label="닫기" onClick={onClose} style={S.xbtn}>✕</button>
                </div>

                {/* 현재 배송 상태 */}
                <div style={S.sectionBox}>
                    <div style={{ fontWeight: 'bold', marginBottom: 15, textAlign: 'left' }}>현재 배송 상태</div>

                    <div style={S.progressWrap}>
                        {/* 베이스 라인 */}
                        <div style={S.progressBase}/>
                        {/* 진행 라인 */}
                        <div style={{ ...S.progressFill, width: `${linePct}%` }}/>

                        {/* 스텝 아이콘 */}
                        {steps.map((st, idx) => {
                            const basePct = 5;   // 왼쪽 시작 여백 (%)
                            const rangePct = 90;  // 실제 분배할 영역 (%)
                            const left = basePct + (idx / (steps.length - 1)) * rangePct;
                            const active = idx <= currentStep;
                            const IconComp = st.Icon;
                            return (
                                <div key={st.key} style={{ ...S.stepItem, left: `calc(${left}% - 20px)` }}>
                                    <div style={{
                                        ...S.stepIcon,
                                        borderColor: active ? "#3F7D20" : "#CFCFCF",
                                        background: "#fff",
                                    }}>
                                        <IconComp size={24} color={active ? "#3F7D20" : "#CFCFCF"} />
                                    </div>
                                    <div style={{ marginTop: 6, fontSize: 12, color: "#2B2B2B" ,whiteSpace: "nowrap", overflow: "visible",  }}>{st.label}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 택배 정보 + 테이블 */}
                <div style={S.infoBox}>
                    <div style={S.infoRow}>
                        <div style={S.infoKey}>택배사</div>
                        <div style={S.infoVal}>{carrierName}&nbsp;&nbsp;{carrierPhone}</div>
                    </div>
                    <div style={{ ...S.infoRow, marginTop: 6 }}>
                        <div style={S.infoKey}>운송장 번호</div>
                        <div style={S.infoVal}>
                            {trackingNumber}
                            <button style={S.linkBtn} onClick={() => copy(trackingNumber)}>복사</button>
                        </div>
                    </div>

                    <div style={S.table}>
                        <div style={S.thead}>
                            <div style={S.th}>배송 시간</div>
                            <div style={S.th}>현재 위치</div>
                            <div style={S.th}>배송 상태</div>
                        </div>
                        <div style={S.tbody}>
                            {[...events].reverse().map((ev, i) => (
                            <div key={i} style={S.tr}>
                                <div style={S.td}>
                                    <div>{ev.time?.split(" ")[0]}</div>
                                    <div>{ev.time?.split(" ")[1]}</div>
                                </div>
                                <div style={S.td}>{ev.location || "-"}</div>
                                <div style={S.td}>{ev.status || "-"}</div>
                            </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 주소(선택) */}
                {address && (
                    <div style={{ marginTop: 10, fontSize: 13, color: "#666" }}>수령지: {address}</div>
                )}

                {/* 하단 버튼 */}
                <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
                    <button onClick={onClose} style={S.confirmBtn}>확인</button>
                </div>
            </div>
        </div>
    );
}

const S = {
  backdrop: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,.45)",
    display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 9999,
  },
  sheet: {
    width: 460, maxWidth: "100%", background: "#fff", borderRadius: 16,
    boxShadow: "0 10px 30px rgba(0,0,0,.2)", padding: 20,
  },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  xbtn: { border: "none", background: "transparent", cursor: "pointer", fontSize: 18 },

  sectionBox: {
    background: "#F7F8F6", borderRadius: 16, padding: 16, marginTop: 6, marginBottom: 14,
    border: "1px solid #EEF0EB",
  },

  progressWrap: { position: "relative", padding: '40px 0px 30px', marginTop: 6 },
  progressBase: {
    position: "absolute", top: 24, left: "5%", right: "5%", height: 8,
    background: "#DADFDA", borderRadius: 8,
  },
  progressFill: {
    position: "absolute", top: 24, left: "3%", height: 8,
    background: "#3F7D20", borderRadius: 8,
  },
  stepItem: { position: "absolute", top: 0, width: 40, textAlign: "center",},
  stepIcon: {
    width: 40, height: 40, borderRadius: 30, border: "2px solid", display: "grid",
    placeItems: "center",
  },

  infoBox: {
    border: "1px solid #E6E8E4", borderRadius: 16, padding: 16, textAlign: 'left'
  },
  infoRow: { display: "flex", gap: 12, alignItems: "baseline" },
  infoKey: { width: 90, color: "#666", fontWeight: 700 },
  infoVal: { flex: 1, fontWeight: 600 },
  linkBtn: {
    marginLeft: 8, border: "none", background: "transparent", textDecoration: "underline",
    cursor: "pointer", fontSize: 13, color: "#2b2b2b",
  },

  table: { marginTop: 14, border: "1px solid #EDEFEA", borderRadius: 12, overflow: "hidden" },
  thead: { display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", background: "#F4F5F3", padding: "10px 12px", fontWeight: 700 },
  th: { fontSize: 14 },
  tbody: { display: "grid" },
  tr: {
    display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr",
    borderTop: "1px solid #F0F1EE", padding: "12px 12px", fontSize: 14,
  },
  td: { display: "flex", flexDirection: "column", gap: 2 },

  confirmBtn: {
    minWidth: 220, padding: "14px 0", borderRadius: 14,
    border: "1px solid #B6D19B", background: "#B6D19B",
    fontSize: 16, fontWeight: 700, color: "#1a1a1a", cursor: "pointer",
  },
};
