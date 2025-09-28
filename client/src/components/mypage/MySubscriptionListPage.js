import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "";

export default function MySubscriptionListPage() {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSubscriptions = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(
          `${API_BASE}/api/my/subscriptions?page=${page}&limit=10`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        if (!res.ok) throw new Error("정기배송 내역 조회 실패");

        const json = await res.json();
        console.log("정기배송 응답:", json);

        const result = json.data?.result ?? [];
        setSubscriptions(result);
        setTotalPages(json.data?.totalPages ?? 1);
      } catch (err) {
        console.error(err);
        setError(err.message || "불러오기 실패");
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, [page]);

  const onAdd = () => navigate("/shop/products/subscription");

  // 배송중/배송완료 분리
  const norm = (v) => String(v ?? '').replace(/\s+/g, '').toUpperCase();

  const delivering = subscriptions.filter(
      (s) => norm(s.latest_delivery?.delivery_status) === '배송중'.toUpperCase()
  );

  const completed = subscriptions.filter(
    (s) => norm(s.latest_delivery?.delivery_status) === '배송완료'.toUpperCase()
  );

  return (
    <div style={styles.pageWrap}>
      <h2 style={styles.pageTitle}>나의 정기배송</h2>
      <hr style={styles.titleLine} />

      {loading && <p>불러오는 중...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={styles.searchHintWrap}>
        <input
          aria-label="검색어를 입력하세요"
          placeholder="검색어를 입력하세요."
          style={styles.searchInput}
        />
        <span style={styles.searchClose}>×</span>
      </div>

      <section style={styles.section}>
        <h3 style={styles.sectionTitle}>배송 중</h3>
        {delivering.length === 0 && <p>배송중인 정기배송이 없습니다.</p>}
        {delivering.map((item) => (
          <SubscriptionCard key={item.order_id} data={item} />
        ))}
      </section>

      <section style={styles.section}>
        <h3 style={styles.sectionTitle}>배송 완료</h3>
        {completed.length === 0 && <p>배송 완료된 내역이 없습니다.</p>}
        {completed.map((item) => (
          <SubscriptionCard key={item.order_id} data={item} completed />
        ))}
      </section>

      {/* 페이지네이션 간단 예시 */}
      <div style={{ marginTop: 16 }}>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            disabled={page === i + 1}
            onClick={() => setPage(i + 1)}
            style={{ marginRight: 8 }}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div style={{ textAlign: "left", marginTop: 16 }}>
        <button type="button" style={styles.addBtn} onClick={onAdd}>
          정기배송 추가
        </button>
      </div>
    </div>
  );
}

function SubscriptionCard({ data, completed = false }) {
  const d = data.latest_delivery || {};
  const status = d.delivery_status || '배송준비';

  const fmtDate = (x) =>
    x ? new Date(x).toLocaleDateString('ko-KR') : '-';
  const fmtKRW = (n) =>
    Number.isFinite(Number(n)) ? Number(n).toLocaleString('ko-KR') + '원' : '-';

  const img = 'https://placehold.co/120x90?text=Subscription';
  const title = '정기배송 상품';
  const qty = '-';

  return (
    <div style={styles.card}>
      <div style={styles.cardInner}>
        <img src={img} alt="상품 이미지" style={styles.thumbnail} />

        <div style={styles.metaCol}>
          <p style={styles.nextShipRow}>
            <span style={styles.nextShip}>
              {d.delivered_at
                ? `배송 완료일: ${fmtDate(d.delivered_at)}`
                : status === '배송중'
                ? '배송 중'
                : '배송 준비중'}
            </span>
            {completed && (
              <span style={styles.changeBadge}>변경</span>
            )}
          </p>
          

          <div style={styles.kvWrap}>
            <div style={styles.kvRow}>
              <span style={styles.k}>수령인</span>
              <span style={styles.v}>{data.receiver_name ?? '-'}</span>
            </div>
            <div style={styles.kvRow}>
              <span style={styles.k}>배송 상태</span>
              <span style={styles.v}>{status}</span>
            </div>
            <div style={styles.kvRow}>
              <span style={styles.k}>택배사</span>
              <span style={styles.v}>{d.courier ?? '-'}</span>
            </div>
            <div style={styles.kvRow}>
              <span style={styles.k}>송장번호</span>
              <span style={styles.v}>{d.tracking_number ?? '-'}</span>
            </div>
            <div style={styles.kvRow}>
              <span style={styles.k}>주기</span>
              <span style={styles.v}>{d.subscription_cycle ?? '-'}</span>
            </div>
          </div>
        </div>

        <div style={styles.payCol}>
          <div style={styles.kvRowSm}>
            <span style={styles.kSm}>상품명</span>
            <span style={styles.vSm}>{title}</span>
          </div>
          <div style={styles.kvRowSm}>
            <span style={styles.kSm}>수량</span>
            <span style={styles.vSm}>{qty}</span>
          </div>

          <div style={styles.kvRowSm}>
            <span style={styles.kSm}>배송비</span>
            <span style={styles.vSm}>{fmtKRW(data.order_shipping_fee)}</span>
          </div>

          <div style={{ ...styles.kvRow, fontWeight: 700 }}>
            <span style={styles.kBold}>결제 금액</span>
            <span style={styles.vBold}>{fmtKRW(data.order_price)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageWrap: {
    maxWidth: "100%",
    width: "100%",
    margin: 0,
    padding: "12px 16px 48px",
    color: "#1d1d1d",
    textAlign: "left",
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 700,
    margin: "4px 0 10px",
  },
  titleLine: {
    border: 0,
    borderTop: "1px solid #333",
    margin: "0 0 18px",
  },
  searchHintWrap: {
    maxWidth: 800,
    position: "relative",
    background: "#eff9ef",
    border: "1px solid #b9d8ba",
    color: "#5e7f5f",
    padding: "8px 40px 8px 14px",
    borderRadius: 9999,
   margin: "10px auto 18px",
  },
  searchInput: {
    width: "100%",
    border: "none",
    background: "transparent",
    outline: "none",
    fontSize: 13,
    textAlign: "center",

  },
  searchClose: {
    position: "absolute",
    right: 14,
    top: 4,
    fontSize: 18,
    lineHeight: "26px",
    color: "#7ea07f",
    cursor: "pointer",
  },
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    fontWeight: 700,
    fontSize: 15,
    margin: "18px 0 10px",
    color: "#1f1f1f",
  },
  card: {
    border: "1px solid #9fb3a0",
    borderRadius: 14,
    padding: 16,
    background: "#fff",
    boxShadow: "0 1px 0 rgba(0,0,0,0.02)",
    marginBottom: 16,
  },
  cardInner: {
    display: "grid",
    gridTemplateColumns: "120px 1fr 1fr",
    gap: 16,
    alignItems: "start",
  },
  thumbnail: {
    width: 120,
    height: 90,
    objectFit: "cover",
    borderRadius: 10,
    border: "1px solid #e1e1e1",
  },
  metaCol: {
    minWidth: 0,
  },
  nextShipRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  nextShip: {
    fontSize: 12,
    color: "#1e1e1e",
    fontWeight: 700,
  },
  changeBadge: {
    fontSize: 11,
    color: "#5e7f5f",
    border: "1px solid #cfe8d0",
    background: "#f2fbf3",
    borderRadius: 6,
    padding: "2px 6px",
  },
  kvWrap: { marginTop: 4 },
  kvRow: {
    display: "grid",
    gridTemplateColumns: "70px 1fr",
    gap: 8,
    alignItems: "center",
    padding: "2px 0",
    textAlign: "left",
  },
  kvRowSm: {
    display: "grid",
    gridTemplateColumns: "80px 1fr",
    gap: 8,
    alignItems: "center",
    padding: "2px 0",
    fontSize: 12,
    color: "#6b6b6b",
    textAlign: "left",
  },
  k: { fontSize: 12, color: "#777", textAlign: "left" },
  v: { fontSize: 12, textAlign: "left" },
  kSm: { fontSize: 12, color: "#7c7c7c" },
  vSm: { fontSize: 12, color: "#333" },
  kBold: { fontSize: 13 },
  vBold: { fontSize: 13 },
  payCol: {
    borderLeft: "1px solid #dfe7df",
    paddingLeft: 16,
  },
  addBtn: {
    border: "1px solid #b9d8ba",
    background: "#e8f4e9",
    color: "#2f5a30",
    padding: "8px 18px",
    borderRadius: 16,
    fontSize: 13,
    cursor: "pointer",
    },
  divider: {
    height: 1,
    border: 0,
    background: "#c7d5c8",
    margin: "6px 0 14px",
  },
};
