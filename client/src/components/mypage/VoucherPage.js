import React, {useState, useEffect} from "react";
import axios from "axios";
import s from "./VoucherPage.module.css";
import ChatbotModal from '../../ai_chatbot/ChatbotModal';
import AIbotButton from '../common/buttons/AIbotButton';
import VoucherUsageModal from '../modal/VoucherUsageModal';

export default function VoucherPage({
  onClickUsage,       // (id) => ...
  onClickRefund,      // (id) => ...
}) {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [chatOpen, setChatOpen] = useState(false);

  const [usageOpen, setUsageOpen] = useState(null);

  const fmtDate = (d) => (d ? `~${d} 까지` : "-");
  const fmtWon = (n) =>
    n == null || isNaN(Number(n)) ? "-" : Number(n).toLocaleString("ko-KR") + "원";

  // voucher_name에서 마켓명 추출 (예: "바로팜 1만원 금액권" -> "바로팜")
  const getMarketName = (name) => {
    if (!name) return "바로팜";
    const m = String(name).trim().split(/\s+/)[0];
    return m || "바로팜";
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr("");

        const token =
          localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
        if (!token) {
          setErr("로그인이 필요합니다.");
          setVouchers([]);
          return;
        }

        const res = await axios.get("/api/my/vouchers", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          params: { page: 1, limit: 10 },
        });

        const list = res?.data?.data?.result ?? [];
        const minDate = (a, b) => {
         if (!a && !b) return null;
         const da = a ? new Date(a) : null;
         const db = b ? new Date(b) : null;
         if (da && db) return (da < db ? da : db).toISOString().slice(0, 10);
         if (da) return da.toISOString().slice(0, 10);
         if (db) return db.toISOString().slice(0, 10);
         return null;
        };
        const mapped = list.map((v) => ({
          id: v.voucher_id,
          marketName: getMarketName(v.voucher_name),
          voucherName: v.voucher_name,
          //imageUrl: "/images/voucher.png",          // API에 이미지 없으니 플레이스홀더
          expiresAt: v.expired_at,
          usableAmount: v.remaining_amount,
          refundableUntil: minDate(v.refundable_date, v.expired_at),                 // 명세서에 없으므로 일단 null
          amount: v.amount,
          usedAmount: (Number.isFinite(+v.amount) && Number.isFinite(+v.remaining_amount))
            ? Math.max(0, +v.amount - +v.remaining_amount)   // 안전하게 0 하한
            : null,
          // ✅ 모달로 넘길 요약
          modalVoucher: {
            title: v.voucher_name,
            expiresAt: v.expired_at,
            remainingAmount: v.remaining_amount,
            refundableUntil: minDate(v.refundable_date, v.expired_at),
            amount: v.amount,
            usedAmount: (Number.isFinite(+v.amount) && Number.isFinite(+v.remaining_amount))
              ? Math.max(0, +v.amount - +v.remaining_amount)
              : null,
            total_used:
              Number.isFinite(+v.amount) && Number.isFinite(+v.remaining_amount)
                ? Math.max(0, +v.amount - +v.remaining_amount)
                : 0,
          },
        }));

        setVouchers(mapped);
      } catch (e) {
        console.error(e);
        setErr("금액권 정보를 불러오지 못했습니다.");
        setVouchers([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className={s.wrap}>
      <div className={s.container}>
        <div className={s.headerRow}>
          <h1 className={s.title}>
            나의 금액권
          </h1>
          <AIbotButton onClick={() => setChatOpen(true)} />
        </div>
        <div className={s.hr} />

        {loading ? (
          <div className={s.empty}>
            <div className={s.emptyTitle}>불러오는 중…</div>
            <div className={s.emptyDesc}>잠시만 기다려주세요.</div>
          </div>
        ) : err ? (
          <div className={s.empty}>
            <div className={s.emptyTitle}>오류</div>
            <div className={s.emptyDesc}>{err}</div>
          </div>
        ) : vouchers.length === 0 ? (
          <div className={s.empty}>
            <div className={s.emptyTitle}>보유 중인 금액권이 없어요</div>
            <div className={s.emptyDesc}>구매/발급 후 이곳에서 확인할 수 있어요.</div>
          </div>
        ) : (
          <ul className={s.list}>
            {vouchers.map((v) => (
              <li key={v.id} className={s.item}>
                {/* <img src={v.imageUrl} alt={v.marketName} className={s.logo} /> */}

                <div className={s.main}>
                  <div className={s.row1}>
                    <span className={s.market}>{v.marketName} 금액권</span>
                  </div>
                  <div className={s.subMarket}>{v.marketName}</div>
                  <div className={s.expire}>{fmtDate(v.expiresAt)}</div>
                </div>

                <div className={s.side}>
                  <div className={s.labelCol}>
                    <div className={s.redLabel}>사용 가능 금액</div>
                    <div className={s.redLabel}>환불 가능 기간</div>
                  </div>
                  <div className={s.valueCol}>
                    <div className={s.value}>{fmtWon(v.usableAmount)}</div>
                    <div className={s.value}>{fmtDate(v.refundableUntil)}</div>
                  </div>

                  <div className={s.actions}>
                    <button
                      className={s.pill}
                      onClick={() => {
                       // 외부 콜백이 있으면 호출 + 모달도 띄우기
                        onClickUsage?.(v.id);
                        setUsageOpen({ id: v.id, voucher: v.modalVoucher });
                      }}
                    >
                      사용 이력
                    </button>
                    <button
                      className={s.pill}
                      onClick={() => onClickRefund && onClickRefund(v.id)}
                    >
                      환불 요청
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        {chatOpen && <ChatbotModal open={chatOpen} onClose={() => setChatOpen(false)} />}
          <VoucherUsageModal
          open={usageOpen}
          voucherId={usageOpen?.id}
          voucher={usageOpen?.voucher}
          onClose={() => setUsageOpen(null)}
          onClickRefund={onClickRefund}
        />
      </div>
    </div>
  );
}