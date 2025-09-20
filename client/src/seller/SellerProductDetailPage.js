// src/seller/SellerProductDetailPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import CouponCard from "./CouponCard";
import ProductDetailInfo from "../components/productDetail/ProductDetailInfo";
import s from "./SellerProductDetailPage.module.css"; // CSS 모듈 임포트

const API_BASE = (process.env.REACT_APP_API_BASE_URL || "").replace(/\/$/, "");
const PLACEHOLDER_IMG = "/images/mock/no-image-240.png";

function toAbs(u) {
  const v = String(u || "").trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  if (!API_BASE) return v.replace(/^\/+/, "");
  return `${API_BASE}/${v.replace(/^\/+/, "")}`;
}

function toKRW(n) {
  const x = Number(n);
  if (!isFinite(x)) return "-";
  try {
    return x.toLocaleString("ko-KR") + "원";
  } catch {
    return `${x}원`;
  }
}

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function normalize(d) {
  if (!d || typeof d !== "object") return null;
  const id = d.product_id ?? d.id;
  const name = String(d.title ?? d.name ?? "상품").trim() || "상품";
  const img =
    d.image_url ??
    d.image ??
    d.thumbnail ??
    d.images?.[0]?.image_url ??
    d.images?.[0]?.img_url ??
    d.images?.[0]?.url ??
    d.img_url ??
    "";
  const images = Array.isArray(d.images)
    ? d.images.map((x) => x.image_url || x.img_url || x.url).filter(Boolean)
    : [];
  return {
    id,
    name,
    title: name,
    intro: d.intro ?? d.description ?? "",
    price: Number(d.price ?? 0),
    weight: d.weight ?? null,
    returnable: d.returnable ?? d.is_returnable ?? false,
    regular_delivery: d.regular_delivery ?? d.is_subscription ?? false,
    image_url: img,
    images,
    created_at: d.created_at ?? null,
    updated_at: d.updated_at ?? null,
    video_url: d.video_url ?? "",
    is_video: d.is_video ?? Boolean(d.video_url),
    detail_page: d.detail_page ?? { figma_export_url: d.figma_export_url ?? "" },
    store_name: d.store_name ?? d.store?.name ?? "내 스토어",
  };
}

export default function SellerProductDetailPage() {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [p, setP] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState({ name: "", price: 0, intro: "" });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const token =
          localStorage.getItem("accessToken") ||
          sessionStorage.getItem("accessToken");
        if (!token) {
          setErr("로그인이 필요합니다.");
          return;
        }

        const u = new URL(`/api/store/product/${id}`, API_BASE);
        u.searchParams.set("_", Date.now());
        const res = await fetch(u.toString(), {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
          cache: "no-store",
        });
        const json = await safeJson(res);
        if (!res.ok)
          throw new Error(
            json?.message ||
              json?.error?.message ||
              `조회 실패 (${res.status})`
          );

        let norm = normalize(json?.data ?? json);

        // fallback 이미지
        if (!norm.image_url) {
          try {
            const u2 = new URL(`/api/products/${id}`, API_BASE);
            u2.searchParams.set("_", Date.now());
            const res2 = await fetch(u2.toString(), {
              cache: "no-store",
              headers: { "Cache-Control": "no-cache" },
            });
            if (res2.ok) {
              const j2 = await safeJson(res2);
              const d2 = j2?.data ?? j2?.product ?? j2;
              const buyerImg =
                d2?.image_url ||
                d2?.main_image_url ||
                d2?.thumbnail ||
                d2?.images?.[0]?.image_url ||
                d2?.images?.[0]?.img_url ||
                d2?.images?.[0]?.url ||
                "";
              if (buyerImg) norm = { ...norm, image_url: buyerImg };
            }
          } catch {}
        }
        if (alive) setP(norm);
      } catch (e) {
        console.error(e);
        if (alive) setErr(e.message || "상품 정보를 불러오지 못했습니다.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  const imgSrc = useMemo(() => {
    const pid = String(p?.id ?? p?.product_id ?? "");
    const name = String(p?.name ?? p?.title ?? "상품");
    const raw =
      p?.image_url ||
      p?.image ||
      p?.thumbnail ||
      p?.main_image_url ||
      p?.images?.[0] ||
      "";
    const url =
      typeof raw === "string"
        ? raw
        : raw?.image_url || raw?.img_url || raw?.url || "";
    const picked =
      url ||
      `https://picsum.photos/seed/${encodeURIComponent(
        pid || name || "default"
      )}/800/600`;
    return /^https?:\/\//i.test(picked) ? picked : toAbs(picked);
  }, [p]);

  const handleEdit = () => {
    if (!p) return;
    setEditData({ name: p.name, price: p.price, intro: p.intro });
    setEditOpen(true);
  };

  const handleSave = async () => {
    try {
      const token =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");
      const res = await fetch(`${API_BASE}/api/store/product/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editData),
      });

      const json = await safeJson(res);
      if (!res.ok) throw new Error(json?.message || "수정 실패");
      alert(json.message || "상품 정보가 수정되었습니다.");
      setP((prev) => ({ ...prev, ...editData }));
      setEditOpen(false);
    } catch (e) {
      alert(`수정 실패: ${e.message}`);
    }
  };

  if (loading) return <div className={s.section}>불러오는 중…</div>;
  if (err) return <div className={s.section} style={{ color: "crimson" }}>{err}</div>;
  if (!p) return <div className={s.section}>상품을 찾을 수 없습니다.</div>;

  return (
    <>
      <section className={s.section}>
        <div className={s.leftCol}>
          <h3 className={s.leftTitle}>상품 상세</h3>
          <div className={s.storeRow}>
            <h2 className={s.storeName}>{p.store_name}</h2>
            <p className={`${s.badge} ${p.returnable ? s.badgeGreen : s.badgeGray}`}>
              {p.returnable ? "반품 가능" : "반품 불가"}
            </p>
            <button className={s.inlineEdit} onClick={handleEdit}>
              ✎ 수정하기
            </button>
          </div>

          <div className={s.imageWrap}>
            <img
              src={imgSrc}
              alt={p.name}
              onError={(e) => (e.currentTarget.src = PLACEHOLDER_IMG)}
              className={s.image}
            />
            <button className={s.editInImage} onClick={handleEdit}>
              ✎ 수정하기
            </button>
          </div>
        </div>

        <div className={s.rightCol}>
          <h2 className={s.productTitle}>
            {p.name}
            {p.weight && <span className={s.variant}>({p.weight})</span>}
            <button className={s.inlineEdit} onClick={handleEdit}>
              ✎ 수정하기
            </button>
          </h2>

          <p className={s.desc}>
            {p.intro || "상품 설명이 없습니다."}
          </p>

          <div className={s.priceRow}>
            <p className={s.price}>{toKRW(p.price)}</p>
          </div>

          <div className={s.couponRow}>
            <CouponCard />
          </div>

          <div className={s.actions}>
            <button className={s.roundBtn} onClick={() => alert("찜하기 기능은 추후 구현됩니다.")}>
              <img src="/logoWithoutText.svg" alt="찜" style={{ width: 20, height: 20 }} />
              찜하기
            </button>
            <div style={{ display: "flex", gap: 12 }}>
              <button className={s.roundBtn}>장바구니</button>
              <button className={s.roundBtn}>구매하기</button>
            </div>
          </div>
        </div>
      </section>

      {/* 수정 모달 */}
      {editOpen && (
        <div className={s.modal}>
          <h3>상품 수정</h3>
          <input
            value={editData.name}
            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            placeholder="상품명"
          />
          <input
            type="number"
            value={editData.price}
            onChange={(e) => setEditData({ ...editData, price: Number(e.target.value) })}
            placeholder="가격"
          />
          <textarea
            value={editData.intro}
            onChange={(e) => setEditData({ ...editData, intro: e.target.value })}
            placeholder="설명"
          />
          <div className={s.modalActions}>
            <button onClick={handleSave}>저장</button>
            <button onClick={() => setEditOpen(false)}>취소</button>
          </div>
        </div>
      )}

      <ProductDetailInfo product={p} />
    </>
  );
}
