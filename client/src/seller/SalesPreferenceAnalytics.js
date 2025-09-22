import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * 매출/선호도 분석 (두 탭 각각 독립 화면)
 * - 탭 전환 시 SalesView / PreferenceView 를 개별 렌더링
 * - 선호도 상단 일러스트의 화살표는 제거 (겹침 이슈 해결)
 */
export default function SalesPreferenceAnalytics() {
  const [activeTab, setActiveTab] = useState("sales"); // "sales" | "preference"
  const [period, setPeriod] = useState("일별");
  const [category, setCategory] = useState("전체");
  const [prefScope, setPrefScope] = useState("품목");
  const navigate = useNavigate();

  const products = [
    {
      id: 1,
      name: "방울토마토",
      status: "상향",
      price: 1500,
      unit: "/ 1단",
      date: "2024.04.24",
      img: "/images/tomato.jpg",
      trend: [12, 18, 16, 20, 24, 27, 29],
      prefNote: "후기 기준 선호도 점수 82% 상승",
      prefTrend: [20, 24, 28, 33, 42, 55, 60],
      prefDir: "up",
    },
    {
      id: 2,
      name: "상추",
      status: "보합",
      price: 1500,
      unit: "/ 1단",
      date: "2024.04.24",
      img: "/images/lettuce.jpg",
      trend: [20, 20, 21, 19, 20, 20, 20],
      prefNote: "후기 기준 선호도 점수 14% 하락",
      prefTrend: [65, 62, 60, 58, 56, 55, 52],
      prefDir: "down",
    },
  ];

  const totalByCategory = useMemo(() => (
    [
      { label: "채소", value: 65, color: "#98B86B" },
      { label: "과일", value: 25, color: "#E8D96E" },
      { label: "기타", value: 10, color: "#E4A6A6" },
    ]
  ), []);

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>매출/선호도 분석</h2>

      {/* 탭 버튼 */}
      <div style={styles.tabRow}>
        <button type="button" onClick={() => setActiveTab("sales")} style={{ ...styles.tab, ...(activeTab === "sales" ? styles.tabActive : {}) }}>매출 분석</button>
        <button type="button" onClick={() => setActiveTab("preference")} style={{ ...styles.tab, ...(activeTab === "preference" ? styles.tabActive : {}) }}>선호도 분석</button>
      </div>

      {activeTab === "sales" ? (
        <SalesView
          period={period}
          setPeriod={setPeriod}
          category={category}
          setCategory={setCategory}
          products={products}
          totalByCategory={totalByCategory}
          onDetail={(id) => navigate(`/products/${id}`)}
        />
      ) : (
        <PreferenceView
          prefScope={prefScope}
          setPrefScope={setPrefScope}
          products={products}
          onDetail={(id) => navigate(`/products/${id}`)}
        />
      )}
    </div>
  );
}

/* =============== 매출 분석 뷰 =============== */
function SalesView({ period, setPeriod, category, setCategory, products, totalByCategory, onDetail }) {
  return (
    <div style={styles.container}>
      <div style={styles.cardsRow}>
        {/* 좌측: 시기별 매출 변화 */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span>시기별 매출 변화</span>
            <select value={period} onChange={(e) => setPeriod(e.target.value)} aria-label="기간 선택" style={styles.select}>
              <option>일별</option>
              <option>주별</option>
              <option>월별</option>
              <option>연별</option>
            </select>
          </div>
          <div style={styles.chartWrap}>
            <BarChart bars={[8, 14, 10, 16, 12, 18, 22]} />
            <div style={styles.legendBox}>
              <div style={styles.legendTitle}>매출</div>
              <div style={styles.legendMeta}>최고가: <b>28,300원</b></div>
              <div style={styles.legendMeta}>최저가: <b>13,200원</b></div>
              <div style={styles.legendMeta}>평균 단가: <b>20,110원</b></div>
            </div>
          </div>
        </div>

        {/* 우측: 매출 품목 비중 */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>매출 품목 비중</div>
          <div style={styles.chartWrapCenter}>
            <PieChart data={totalByCategory} size={160} />
          </div>
        </div>
      </div>

      {/* 품목별 매출 현황 */}
      <div style={{ ...styles.card, marginTop: 20 }}>
        <div style={styles.cardHeader}>
          <span>품목별 매출 현황</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="품목 카테고리 선택" style={styles.select}>
            <option>전체</option>
            <option>채소</option>
            <option>과일</option>
            <option>기타</option>
          </select>
        </div>
        <div style={{ display: "grid", gap: 12 }}>
          {products.map((p) => (
            <ProductRow key={p.id} mode="sales" product={p} onDetail={() => onDetail(p.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* =============== 선호도 분석 뷰 =============== */
function PreferenceView({ prefScope, setPrefScope, products, onDetail }) {
    const navigate = useNavigate();
  return (
    <div style={styles.container}>
      {/* 상단 카드: 스토어 전체 선호도 분석 */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <span>스토어 전체 선호도 분석</span>
          
                <button
                type="button"
                style={styles.detailBtn}
                onClick={() => navigate('/analytics/preference/overview')}
                >자세히 보기 ›</button>

        </div>
        <div style={{ padding: 8, minHeight: 160, display: "flex", alignItems: "center" }}>
          <PreferenceBars />
        </div>
      </div>

      {/* 하단 카드: 품목별 선호도 */}
      <div style={{ ...styles.card, marginTop: 20 }}>
        <div style={styles.cardHeader}>
          <span>품목별 선호도</span>
          <select value={prefScope} onChange={(e) => setPrefScope(e.target.value)} aria-label="선호도 범위" style={styles.select}>
            <option>품목</option>
            <option>카테고리</option>
            <option>기간</option>
          </select>
        </div>
        <div style={{ display: "grid", gap: 12 }}>
          {products.map((p) => (
            <ProductRow key={p.id} mode="preference" product={p} onDetail={() => onDetail(p.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* =============== 공통 컴포넌트 =============== */
function ProductRow({ product, onDetail, mode = "sales" }) {
  return (
    <div style={styles.productRow}>
      <div style={styles.productLeft}>
        <img
          src={product.img}
          alt={`${product.name} 이미지`}
          style={styles.productThumb}
          onError={(e) => (e.currentTarget.src = "/images/onion.jpg")}
        />
        <div>
          <div style={styles.productName}>{product.name}</div>
          {mode === "sales" ? (
            <div style={styles.productMetaWrap}>
              <Meta label="성장률" value={product.status} />
              <Meta label="총 매출" value={`${product.price}${product.unit}`} />
              <Meta label="등록일" value={product.date} />
            </div>
          ) : (
            <div style={styles.productMetaWrap}>
              <Meta label="한줄 요약" value={product.prefNote} />
              <Meta label="방향" value={<TrendPill dir={product.prefDir} />} />
            </div>
          )}
        </div>
      </div>

      <div style={styles.productRight}>
        {mode === "sales" ? <Sparkline data={product.trend} /> : <Sparkline data={product.prefTrend} />}
        <button type="button" onClick={onDetail} style={styles.detailBtn}>자세히 보기 ›</button>
      </div>
    </div>
  );
}

function Meta({ label, value }) {
  return (
    <div style={styles.meta}>
      <div style={styles.metaLabel}>{label}</div>
      <div style={styles.metaValue}>{value}</div>
    </div>
  );
}

function TrendPill({ dir }) {
  const up = dir === "up";
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "4px 8px",
      borderRadius: 999,
      border: "1px solid #D1D5DB",
      fontSize: 12,
      color: up ? "#1B7F3A" : "#B91C1C",
      background: up ? "#E9F7EE" : "#FEEBEC",
      minWidth: 44,
      justifyContent: "center",
    }}>
      {up ? "상승" : "하락"}
    </span>
  );
}

/* =============== 간단 차트 =============== */
function BarChart({ bars = [] }) {
  const width = 260, height = 120, gap = 10;
  const barWidth = (width - (bars.length + 1) * gap) / bars.length;
  const max = Math.max(...bars, 1);
  return (
    <svg width={width} height={height} role="img" aria-label="막대 차트" style={{ display: "block" }}>
      {bars.map((v, i) => {
        const h = (v / max) * (height - 20);
        const x = gap + i * (barWidth + gap);
        const y = height - h - 10;
        return <rect key={i} x={x} y={y} width={barWidth} height={h} rx={4} fill="#9CC285" />;
      })}
      <line x1={8} y1={height - 10} x2={width - 4} y2={height - 10} stroke="#777" strokeWidth={1} />
      <line x1={8} y1={8} x2={8} y2={height - 10} stroke="#777" strokeWidth={1} />
    </svg>
  );
}

function Sparkline({ data = [] }) {
  const width = 120, height = 40;
  const max = Math.max(...data, 1);
  const step = width / (data.length - 1 || 1);
  const points = data.map((v, i) => `${i * step},${height - (v / max) * (height - 6) - 3}`).join(" ");
  return (
    <svg width={width} height={height} aria-label="추세" style={{ display: "block" }}>
      <polyline points={points} fill="none" stroke="#6A98D0" strokeWidth={2} />
    </svg>
  );
}

function PieChart({ data, size = 160 }) {
  const radius = size / 2; const c = { x: radius, y: radius };
  const total = data.reduce((s, d) => s + d.value, 0);
  let start = -Math.PI / 2;
  const slices = data.map((d, i) => {
    const angle = (d.value / total) * Math.PI * 2;
    const end = start + angle;
    const x1 = c.x + radius * Math.cos(start), y1 = c.y + radius * Math.sin(start);
    const x2 = c.x + radius * Math.cos(end), y2 = c.y + radius * Math.sin(end);
    const large = angle > Math.PI ? 1 : 0;
    const path = `M ${c.x} ${c.y} L ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2} Z`;
    start = end;
    return <path key={i} d={path} fill={d.color} />;
  });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <svg width={size} height={size} role="img" aria-label="원형 차트">{slices}</svg>
      <div>
        {data.map((d) => (
          <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ width: 12, height: 12, background: d.color, borderRadius: 2, display: "inline-block" }} />
            <span style={{ fontSize: 14, color: "#333" }}>{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 선호도 일러스트 (화살표 제거한 바형만)
function PreferenceBars() {
  return (
    <svg width="240" height="120" viewBox="0 0 240 120">
      <rect x="20" y="60" width="26" height="40" rx="4" fill="#9CC285" />
      <rect x="60" y="50" width="26" height="50" rx="4" fill="#8AB0E0" />
      <rect x="100" y="40" width="26" height="60" rx="4" fill="#9CC285" />
      <rect x="140" y="30" width="26" height="70" rx="4" fill="#8AB0E0" />
    </svg>
  );
}

/* =============== 스타일 =============== */
const styles = {
  page: { padding: "20px 24px 40px" },
  title: { fontSize: 22, fontWeight: 700, margin: "8px 0 18px" , textAlign: 'left'},
  tabRow: { display: "flex", gap: 10, marginBottom: 16 },
  tab: { padding: "10px 16px", borderRadius: 999, border: "1px solid #cfd8cf", background: "#fff", cursor: "pointer", fontSize: 14 },
  tabActive: { background: "#9CC285", color: "#fff", borderColor: "#9CC285", fontWeight: 600 },
  container: { display: "flex", flexDirection: "column", gap: 16 },
  cardsRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  card: { background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: 16 },
  cardHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", fontWeight: 600, marginBottom: 12 },
  select: { border: "1px solid #D1D5DB", borderRadius: 8, padding: "8px 10px", fontSize: 14 },
  chartWrap: { display: "grid", gridTemplateColumns: "auto 1fr", gap: 16, alignItems: "center", minHeight: 140 },
  chartWrapCenter: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: 180 },
  legendBox: { background: "#F3F7EE", border: "1px solid #D8E4CF", borderRadius: 12, padding: 12, fontSize: 13, color: "#3A4B2E" },
  legendTitle: { fontWeight: 700, marginBottom: 6 },
  legendMeta: { marginTop: 2 },
  productRow: { display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid #E5E7EB", borderRadius: 12, padding: 12 },
  productLeft: { display: "flex", alignItems: "center", gap: 12 },
  productThumb: { width: 72, height: 48, objectFit: "cover", borderRadius: 8, border: "1px solid #e5e7eb" },
  productName: { fontWeight: 700, marginBottom: 6 },
  productMetaWrap: { display: "flex", gap: 16, flexWrap: "wrap" },
  meta: { display: "grid", gap: 4 },
  metaLabel: { fontSize: 12, color: "#6B7280" },
  metaValue: { fontSize: 14, color: "#111827", fontWeight: 600 },
  productRight: { display: "flex", alignItems: "center", gap: 12 },
  detailBtn: { border: "1px solid #D1D5DB", borderRadius: 10, padding: "8px 10px", fontSize: 13, background: "#fff", cursor: "pointer" },
};