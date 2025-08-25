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

// ✅ 당신 앱의 주문 목록 기본 경로만 여기서 정하면 나머지는 자동 매핑됩니다.
const ORDERS_BASE = "/my/orders"; // 앱이 /orders 라면 "/orders" 로만 바꾸세요.
const SEARCH_PATH = "/search";        // 검색 페이지를 쓰면 경로 지정(없으면 그대로 유지)
const SEASONAL_PATH = "/seasonal";    // 제철 상품 페이지 경로(선택)

export default function ChatbotModal({ open, onClose, role = "buyer" }) {
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]); // [{from:'user'|'bot', text, cards, followups}]
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  const isSeller = role === "seller";
  const title = isSeller ? "바로팜 판매자 도우미" : "바로팜 구매자 도우미";
  const subtitle = "무엇을 도와드릴까요?";

  // 퀵 버튼 → menu 호출
  const quickMenus = useMemo(() => {
    return isSeller
      ? {
          "서비스 사용 안내": { menu_id: "help" },
          "판매 데이터 확인": { menu_id: "sales_overview" },
          "상품 등록 도움": { menu_id: "product_register" },
          "재고/배송 설정": { menu_id: "shipping" },
          "고객 문의 응대": { menu_id: "customer_support" },
        }
      : {
          "상품 문의": { menu_id: "product" },
          "배송 문의": { menu_id: "shipping" },
          "환불 문의": { menu_id: "refund" },
          "주문 및 결제": { menu_id: "payment" },
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
  // /order → /mypage/orders 같은 치환
  const routeAlias = (to) => {
    if (!to) return to;
    let out = to;

    // 단수 → 복수, 루트별 alias
    out = out.replace(/^\/order(\/|$)/, `${ORDERS_BASE}$1`);
    out = out.replace(/^\/orders(\/|$)/, `${ORDERS_BASE}$1`); // 혹시 BE가 /orders 라고 주면 우리 기준으로
    out = out.replace(/^\/mypage\/order(\/|$)/, `${ORDERS_BASE}$1`);

    return out;
  };

  // 챗봇 URL → 내부(app) or 외부(external) 판별 + 매핑
  const resolveLink = (url) => {
    if (!url) return null;

    // 절대 외부 링크
    if (/^https?:\/\//i.test(url)) return { kind: "external", href: url };

    // API 패턴을 SPA 라우트로 변환
    if (/^\/api\/my\/orders$/i.test(url)) return { kind: "app", to: ORDERS_BASE };
    const detail = url.match(/^\/api\/orders\/(\d+)/i);
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

      // 2) menu_id에 따른 라우팅 스위치 (명세 예시 대응)
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
      if (fu?.menu_id === "product_seasonal_list" && SEASONAL_PATH) {
        const m = fu?.params?.month;
        goto(`${SEASONAL_PATH}${m ? `?month=${encodeURIComponent(m)}` : ""}`);
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

            {/* 최초 진입 시 퀵버튼 */}
            {/* {history.length === 0 && (
              <div className="chatbot-quickCol">
                {quickItems.map((label) => (
                  <button
                    key={label}
                    className="chatbot-quickPill"
                    onClick={() => handleQuick(label)}
                  >
                    {label}
                  </button>
                ))} */}
              {/* </div> */}
            {/* )} */}
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
              disabled={!canSend}
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
