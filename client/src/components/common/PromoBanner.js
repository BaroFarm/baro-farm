import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

const API_BASE = (process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_URL || "").replace(/\/$/, "");
const BANNERS_SRC = (process.env.REACT_APP_BANNERS_SRC || "static").toLowerCase(); 
// static | api

export default function PromoBanner(){
  const [banners, setBanners] = useState([]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef(null);

  const FALLBACK_BANNERS = [
    {
      banner_id: "local-1",
      title: "7월 여름맞이 할인!",
      image_url: "/images/mock/banner1.jpg",
      // link_url: "/event/summer",
      alt_text: "여름 특가 이벤트 배너",
      priority: 1,
      position: "main",
    },
    {
      banner_id: "local-2",
      title: "정기배송 상품 추천",
      image_url: "/images/mock/banner2.jpg",
      // link_url: "/subscription",
      alt_text: "정기배송 추천 배너",
      priority: 2,
      position: "main",
    },
  ];

  // 데이터 로딩
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (BANNERS_SRC === "static" || !API_BASE) {
        if (!cancelled) setBanners(FALLBACK_BANNERS);
        return;
      }
      const ctrl = new AbortController();
      try {
        const res = await axios.get(`${API_BASE}/api/banners`, {
          params: { position: "main", limit: 3 },
          signal: ctrl.signal,
        });
        const rows = (res?.data?.data ?? []).map((b) => ({
          banner_id: b.banner_id ?? b.id,
          title: b.title,
          image_url: b.image_url ?? b.img_url,
          link_url: b.link_url ?? "#",
          alt_text: b.alt_text ?? b.title ?? "배너",
          priority: b.priority,
          position: b.position,
        }));
        if (!cancelled) setBanners(rows.length ? rows : FALLBACK_BANNERS);
      } catch (err) {
        if (!cancelled) setBanners(FALLBACK_BANNERS);
        console.warn("배너 불러오기 실패, 폴백 사용:", err?.message || err);
      }
      return () => ctrl.abort();
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // 자동 슬라이드 (2초 간격)
  useEffect(() => {
    // 배너가 2개 이상이고, 일시정지 상태가 아니면 타이머 작동
    if (banners.length > 1 && !paused) {
      intervalRef.current = setInterval(() => {
        setIndex((prev) => (prev + 1) % banners.length);
      }, 4000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [banners, paused]);

  // 현재 index가 배열 길이를 넘지 않도록(데이터 갱신 시)
  useEffect(() => {
    if (index >= banners.length && banners.length > 0) {
      setIndex(0);
    }
  }, [banners, index]);

  // 스타일
  const outerStyle = {
    border: "2px solid #4caf50",
    overflow: "hidden",
    width: "97%",
    display: "flex",
    justifyContent: "center",
    padding: "16px",
  };

  const viewportStyle = {
    width: 900,
    height: 250,
    overflow: "hidden",
    borderRadius: 8,
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
  };

  const trackStyle = {
    display: "flex",
    width: `${banners.length * 100}%`,
    height: "100%",
    transform: `translateX(-${index * (100 / (banners.length || 1))}%)`,
    transition: "transform 600ms ease",
  };

  const slideStyle = {
    width: 900,
    height: 250,
    flex: "0 0 900px",
  };

  if (banners.length === 0) {
    return (
      <div style={outerStyle}>
        <div style={{
          width: 900, height: 250, backgroundColor: "#eee",
          display: "flex", justifyContent: "center", alignItems: "center",
          color: "#555", fontSize: 18, borderRadius: 8
        }}>
          배너 이미지 준비 중...
        </div>
      </div>
    );
  }

  return (
    <div
      style={outerStyle}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div style={viewportStyle}>
        <div style={trackStyle}>
          {banners.map((banner) => (
            <a
              key={banner.banner_id}
              href={banner.link_url || "#"}
              className="block"
              style={slideStyle}
            >
              <img
                src={banner.image_url}
                alt={banner.alt_text || banner.title}
                className="w-full object-cover"
                style={{ width: "100%", height: "110%" }}
                loading="lazy"
                draggable="false"
                onError={(e) => { e.currentTarget.src = "/images/placeholder-banner.png"; }}
              />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
