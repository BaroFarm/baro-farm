import React from "react";
import { useNavigate } from "react-router-dom";

export default function MySubscriptionListPage() {
  const navigate = useNavigate();

  const delivering = [
    {
      id: 1,
      title: "상품명",
      qty: "수량",
      nextShip: "예정 배송일: 7월 31일",
      price: "~~~원",
      discount: "~~ ~원",
      shippingFee: "~~ ~원",
      payAmount: "~~ ~~원",
      payMethod: "농협 카드",
      img: "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?q=80&w=400&auto=format&fit=crop",
    },
  ];

  const completed = [
    {
      id: 2,
      title: "상품명",
      qty: "수량",
      nextShip: "다음 배송일: 7월 31일",
      changeLabel: "변경",
      price: "~~~원",
      discount: "~~ ~원",
      shippingFee: "~~ ~원",
      payAmount: "~~ ~~원",
      payMethod: "결제 전",
      img: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?q=80&w=400&auto=format&fit=crop",
    },
  ];

  const onAdd = () => navigate("/subscription/apply");

  return (
    <div style={styles.pageWrap}>
      <h2 style={styles.pageTitle}>나의 정기배송</h2>
      <hr style={styles.titleLine} />

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
        {delivering.map((item) => (
          <SubscriptionCard key={item.id} data={item} />
        ))}
      </section>

      <section style={styles.section}>
        <h3 style={styles.sectionTitle}>배송 완료</h3>
        {completed.map((item) => (
          <SubscriptionCard key={item.id} data={item} completed />
        ))}
      </section>

      <div style={{ textAlign: "left", marginTop: 16 }}>
        <button type="button" style={styles.addBtn} onClick={onAdd}>
          정기배송 추가
        </button>
      </div>
    </div>
  );
}

function SubscriptionCard({ data, completed = false }) {
  const {
    title,
    qty,
    nextShip,
    changeLabel,
    price,
    discount,
    shippingFee,
    payAmount,
    payMethod,
    img,
  } = data;

  return (
    <div style={styles.card}>
      <div style={styles.cardInner}>
        <img src={img} alt="상품 이미지" style={styles.thumbnail} />

        <div style={styles.metaCol}>
          <p style={styles.nextShipRow}>
            <span style={styles.nextShip}>{nextShip}</span>
            {completed && changeLabel && (
              <span style={styles.changeBadge}>{changeLabel}</span>
            )}
          </p>

          <div style={styles.kvWrap}>
            <div style={styles.kvRow}>
              <span style={styles.k}>상품명</span>
              <span style={styles.v}>{title}</span>
            </div>
            <div style={styles.kvRow}>
              <span style={styles.k}>수량</span>
              <span style={styles.v}>{qty}</span>
            </div>
          </div>
        </div>

        <div style={styles.payCol}>
          <div style={styles.kvRowSm}>
            <span style={styles.kSm}>상품 가격</span>
            <span style={styles.vSm}>{price}</span>
          </div>
          <div style={styles.kvRowSm}>
            <span style={styles.kSm}>할인 금액</span>
            <span style={styles.vSm}>{discount}</span>
          </div>
          <div style={{ ...styles.kvRowSm, marginBottom: 8 }}>
            <span style={styles.kSm}>배송비</span>
            <span style={styles.vSm}>{shippingFee}</span>
          </div>

          <div style={{ ...styles.kvRow, fontWeight: 700 }}>
            <span style={styles.kBold}>결제 금액</span>
            <span style={styles.vBold}>{payAmount}</span>
          </div>
          <div style={styles.kvRow}>
            <span style={styles.k}>결제 수단</span>
            <span style={styles.v}>{payMethod}</span>
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
