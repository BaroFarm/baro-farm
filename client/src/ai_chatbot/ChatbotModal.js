// src/ai_chatbot/ChatbotModal.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  HiOutlineChatBubbleLeft,
  HiOutlineXMark,
  HiOutlineMicrophone,
  HiOutlinePaperAirplane,
} from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import "./ChatbotModal.css";

const BASE = (process.env.REACT_APP_API_BASE_URL || "").replace(/\/$/, "");

// ✅ 앱 라우팅 기본 경로
const ORDERS_BASE = "/my/orders";
const REFUNDS_BASE = "/my/refunds";   // 환불/반품 내역 페이지가 없으면 ORDERS_BASE로 폴백됨
const SEARCH_PATH = "/search";
const SEASONAL_PATH = "/seasonal";

export default function ChatbotModal({ open, onClose, role = "buyer" }) {
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]); // [{from:'user'|'bot', text, cards, followups}]
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  const isSeller = role === "seller";
  const title = isSeller ? "바로팜 판매자 도우미" : "바로팜 구매자 도우미";
  const subtitle = "무엇을 도와드릴까요?";

  // 퀵 버튼 → menu 호출 (백엔드 스펙에 있는 메뉴만)
  const quickMenus = useMemo(() => {
    return isSeller
      ? {
          // 백엔드에 없는 help/sales_overview/product_register/customer_support 제거/대체
          "서비스 사용 안내": { menu_id: "guide" },
          "판매 데이터 확인": { menu_id: "sales_data" },
          "납품업체/판매자 연결": { menu_id: "call" },
        }
      : {
          "상품 문의": { menu_id: "product" },
          "배송 문의": { menu_id: "shipping" },
          "환불 문의": { menu_id: "refund" },
          "주문 및 결제": { menu_id: "order_payment" }, // ✅ 백엔드와 일치
          "배송 전 변경": { menu_id: "shipping_change_address" },
        };
  }, [isSeller]);

  const quickItems = useMemo(() => Object.keys(quickMenus), [quickMenus]);

  useEffect(() => {
    if (!open) {
      setHistory([]);
      setMsg("");
      setLoading(false);
    }
  }, [open]);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history, loading]);

  if (!open) return null;

  // ---------- API helpers ----------
  const normalizeReply = (json) => {
    const r =
      json?.reply ||
      json?.data?.reply ||
      (Array.isArray(json?.replies) ? json.replies[0] : null) ||
      {};
    return {
      text: r?.text || json?.text || "",
      cards: Array.isArray(r?.cards) ? r.cards : [],
      followups: Array.isArray(r?.followups) ? r.followups : [],
    };
  };

  const callChat = async (payload) => {
    const token = localStorage.getItem("accessToken");
    const res = await fetch(`${BASE}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    const raw = await res.text();
    let json;
    try {
      json = JSON.parse(raw);
    } catch {
      throw new Error(raw || `요청 실패 (${res.status})`);
    }
    if (!res.ok || (json.status && json.status !== "success")) {
      throw new Error(json?.message || "요청 실패");
    }
    return normalizeReply(json);
  };

  const sendFreeText = (message) =>
    callChat({ type: "free_text", message, params: { context_role: role } });

  const sendMenu = (menu_id, params = {}) =>
    callChat({ type: "menu", menu_id, params: { ...params, context_role: role } });

  // ---------- 라우팅 보조 ----------
  const routeAlias = (to) => {
    if (!to) return to;
    let out = to;

    // 단수 → 복수, 루트별 alias
    out = out.replace(/^\/order(\/|$)/, `${ORDERS_BASE}$1`);
    out = out.replace(/^\/orders(\/|$)/, `${ORDERS_BASE}$1`);
    out = out.replace(/^\/mypage\/order(\/|$)/, `${ORDERS_BASE}$1`);

    return out;
  };

  // /api/products*, /api/products/seasonal* → 앱 라우트로
  function mapProductsApiToApp(url) {
    const u = new URL(url, "http://_dummy");
    if (/^\/api\/products\/?$/i.test(u.pathname)) {
      const q = u.searchParams.get("query") || "";
      if (SEARCH_PATH) {
        return {
          kind: "app",
          to: `${SEARCH_PATH}${q ? `?keyword=${encodeURIComponent(q)}` : ""}`,
        };
      }
    }
    if (/^\/api\/products\/seasonal\/?$/i.test(u.pathname)) {
      const m = u.searchParams.get("month");
      if (SEASONAL_PATH) {
        return {
          kind: "app",
          to: `${SEASONAL_PATH}${m ? `?month=${encodeURIComponent(m)}` : ""}`,
        };
      }
    }
    return null;
  }

  // 챗봇 URL → 내부(app) or 외부(external) 판별 + 매핑
  const resolveLink = (url) => {
    if (!url) return null;

    // 절대 외부 링크
    if (/^https?:\/\//i.test(url)) return { kind: "external", href: url };

    // 제품/제철 전용 매핑
    const mapped = mapProductsApiToApp(url);
    if (mapped) return mapped;

    // 주문 목록 (/api/my/orders[?order_id=...]) → 앱 라우트
    const u = new URL(url, "http://_dummy");
    if (/^\/api\/my\/orders$/i.test(u.pathname)) {
      const oid = u.searchParams.get("order_id");
      return { kind: "app", to: `${ORDERS_BASE}${oid ? `?order_id=${encodeURIComponent(oid)}` : ""}` };
    }

    // 환불/반품 내역 (/api/my/cancel) → 앱 라우트(없으면 주문 목록으로 폴백)
    if (/^\/api\/my\/cancel$/i.test(u.pathname)) {
      return { kind: "app", to: REFUNDS_BASE || ORDERS_BASE };
    }

    // 주문 상세 (/api/orders/:id) → /my/orders/:id
    const detail = u.pathname.match(/^\/api\/orders\/(\d+)/i);
    if (detail) return { kind: "app", to: `${ORDERS_BASE}/${detail[1]}` };

    // 일반 내부 경로
    if (/^\//.test(url) && !/^\/api\//i.test(url)) {
      return { kind: "app", to: routeAlias(url) };
    }

    return null;
  };

  const goto = (to, { close = false } = {}) => {
    navigate(to);
    if (close) onClose?.();
  };

  // ---------- UI handlers ----------
  const pushUser = (text) => setHistory((h) => [...h, { from: "user", text }]);
  const pushBot = (rep) =>
    setHistory((h) => [
      ...h,
      { from: "bot", text: rep.text, cards: rep.cards, followups: rep.followups },
    ]);

  const handleSend = async (textFromUI) => {
    const payloadText = (textFromUI ?? msg).trim();
    if (!payloadText || loading) return;

    setMsg("");
    pushUser(payloadText);
    setLoading(true);
    try {
      const rep = await sendFreeText(payloadText);
      pushBot(rep);
    } catch (e) {
      pushBot({ text: e.message || "요청 중 오류가 발생했습니다.", cards: [], followups: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleQuick = async (label) => {
    const conf = quickMenus[label];
    const shown = label.trim();
    pushUser(shown);
    setLoading(true);
    try {
      const rep = await sendMenu(conf.menu_id, conf.params);
      pushBot(rep);
    } catch {
      try {
        pushBot(await sendFreeText(shown));
      } catch (e2) {
        pushBot({ text: e2.message || "요청 중 오류가 발생했습니다.", cards: [], followups: [] });
      }
    } finally {
      setLoading(false);
    }
  };

  // 팔로업: url 우선 → 특정 menu_id 스위치 → 일반 menu → free_text
  const handleFollowup = async (fu) => {
    const label = fu?.label || "다음";
    pushUser(label);
    setLoading(true);
    try {
      // 1) url이 오면 즉시 라우팅
      if (fu?.url) {
        const link = resolveLink(fu.url);
        if (link?.kind === "app") goto(link.to /* , { close: true } */);
        else if (link?.kind === "external") window.open(link.href, "_blank", "noopener");
        setLoading(false);
        return;
      }

      // 2) menu_id에 따른 라우팅 스위치
      if (fu?.menu_id === "orders_page") {
        goto(ORDERS_BASE);
        setLoading(false);
        return;
      }
      if (fu?.menu_id === "order_detail" && fu?.params?.order_id) {
        goto(`${ORDERS_BASE}/${fu.params.order_id}`);
        setLoading(false);
        return;
      }
      if (fu?.menu_id === "product_search" && fu?.params?.keyword && SEARCH_PATH) {
        const q = encodeURIComponent(fu.params.keyword);
        goto(`${SEARCH_PATH}?keyword=${q}`);
        setLoading(false);
        return;
      }
      // 제철: 페이지 이동 대신 채팅 내 미리보기 카드로 응답 받기
      if (fu?.menu_id === "product_seasonal_list") {
        const rep = await sendMenu("product_seasonal_list", fu.params || {});
        pushBot(rep);
        setLoading(false);
        return;
      }

      // 3) 일반 menu 호출
      if (fu?.menu_id) {
        pushBot(await sendMenu(fu.menu_id, fu.params || {}));
      } else {
        // 4) 최후: free_text
        pushBot(await sendFreeText(label));
      }
    } catch (e) {
      pushBot({ text: e.message || "요청 중 오류가 발생했습니다.", cards: [], followups: [] });
    } finally {
      setLoading(false);
    }
  };

  const canSend = !loading && msg.trim().length > 0;

  // ---------- Render ----------
  return (
    <div className="chatbot-overlay" role="dialog" aria-modal="true">
      <div className="chatbot-modal">
        {/* Header */}
        <div className="chatbot-header">
          <div className="chatbot-header-left">
            <span className="chatbot-iconBox">
              <HiOutlineChatBubbleLeft size={14} />
            </span>
            <span className="chatbot-title">AI 챗봇</span>
            <span className="chatbot-roleBadge">{isSeller ? "판매자" : "구매자"}</span>
          </div>
          <button onClick={onClose} className="chatbot-closeBtn" aria-label="닫기">
            <HiOutlineXMark size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="chatbot-body">
          <div className="chatbot-greeting">
            <div>{title}</div>
            <div className="chatbot-subtitle">{subtitle}</div>
          </div>

          {/* 대화 영역 */}
          <div ref={scrollRef} className="chatbot-chatArea">
            {/* 항상 맨 위에 표시되는 퀵버튼 영역 */}
            <div className="chatbot-quickCol">
              {quickItems.map((label) => (
                <button
                  key={label}
                  className="chatbot-quickPill"
                  onClick={() => handleQuick(label)}
                >
                  {label}
                </button>
              ))}
            </div>

            {history.map((m, i) => (
              <div
                key={i}
                className={`chatbot-bubble ${
                  m.from === "user" ? "chatbot-bubbleUser" : "chatbot-bubbleBot"
                }`}
              >
                <div>{m.text}</div>

                {/* cards */}
                {Array.isArray(m.cards) && m.cards.length > 0 && (
                  <div className="chatbot-cards">
                    {m.cards.map((c, idx) => {
                      // 가이드 카드
                      if (c.type === "tips" && Array.isArray(c.items)) {
                        return (
                          <div key={idx} className="chatbot-card">
                            <b className="chatbot-card-title">가이드</b>
                            <ul className="chatbot-card-list">
                              {c.items.map((it, j) => (
                                <li key={j}>
                                  <b>{it.k}</b>: {it.v}
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      }

                      // 링크 카드
                      if (c.type === "link" && c.url) {
                        const link = resolveLink(c.url);
                        if (link?.kind === "app") {
                          return (
                            <button
                              key={idx}
                              className="chatbot-linkCard"
                              onClick={() => goto(link.to)}
                            >
                              {c.label || "바로가기"}
                            </button>
                          );
                        }
                        if (link?.kind === "external") {
                          return (
                            <a
                              key={idx}
                              href={link.href}
                              target="_blank"
                              rel="noreferrer"
                              className="chatbot-linkCard"
                            >
                              {c.label || "바로가기"}
                            </a>
                          );
                        }
                      }

                      // 제품 미리보기 카드 (옵션)
                      if (c.type === "products" && Array.isArray(c.items)) {
                        return (
                          <div key={idx} className="chatbot-card">
                            {c.title && <b className="chatbot-card-title">{c.title}</b>}
                            <div className="cb-productsRow">
                              {c.items.map((p) => (
                                <button
                                  key={p.id ?? p.product_id}
                                  className="cb-productCard"
                                  onClick={() => goto(`/product/${p.id ?? p.product_id}`)}
                                  title={p.title}
                                >
                                  <img src={p.image} alt={p.title} />
                                  <div className="tit">{p.title}</div>
                                  {"price" in p && p.price != null && (
                                    <div className="price">
                                      {Number(p.price).toLocaleString()}원
                                    </div>
                                  )}
                                </button>
                              ))}
                            </div>

                            {c.more && (() => {
                              const link = resolveLink(c.more.url);
                              if (link?.kind === "app") {
                                return (
                                  <button
                                    className="chatbot-linkCard"
                                    onClick={() => goto(link.to)}
                                  >
                                    {c.more.label || "전체 보기"}
                                  </button>
                                );
                              }
                              if (link?.kind === "external") {
                                return (
                                  <a
                                    className="chatbot-linkCard"
                                    href={link.href}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    {c.more.label || "전체 보기"}
                                  </a>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        );
                      }

                      return null;
                    })}
                  </div>
                )}

                {/* followups */}
                {Array.isArray(m.followups) && m.followups.length > 0 && (
                  <div className="chatbot-followups">
                    {m.followups.map((fu, j) => (
                      <button
                        key={j}
                        className="chatbot-followBtn"
                        onClick={() => handleFollowup(fu)}
                      >
                        {fu.label || "다음"}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="chatbot-inputBar">
          <div className="chatbot-inputWrapper">
            <input
              className="chatbot-input"
              placeholder={loading ? "응답 대기 중..." : "메시지를 입력해주세요!"}
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={loading}
            />
            <button
              type="button"
              className="chatbot-iconBtn chatbot-sendBtn"
              aria-label="전송"
              title="전송"
              onClick={() => handleSend()}
              disabled={!(!loading && msg.trim().length > 0)}
            >
              <HiOutlinePaperAirplane size={18} />
            </button>
            <button
              type="button"
              className="chatbot-iconBtn"
              aria-label="음성 입력"
              title="음성 입력"
              onClick={() => alert("음성 입력은 추후 제공됩니다.")}
            >
              <HiOutlineMicrophone size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
