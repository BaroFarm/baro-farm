import React, { useEffect, useRef, useState } from "react";
import styles from "./VoucherUsageModal.module.css";

export default function VoucherUsageModal({
  open,
  voucherId,
  voucher,            // ★ 부모가 넘겨주는 요약 데이터(필수)
  loadUsage,          // ★ (선택) 사용 이력 로더가 있을 때만 호출
  onClose,
  onClickRefund,
}) {
  const [loading, setLoading] = useState(false);   // 기본은 false (프롭만으로 렌더)
  const [err, setErr] = useState("");
  const [rows, setRows] = useState([]);
  const [totalUsed, setTotalUsed] = useState(0);
  const firstFocusRef = useRef(null);

  const d2 = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");
  const fmtDate = (d) => (d ? d2(d) : "-");
  const fmtRange = (d) => (d ? `~${fmtDate(d)} 까지` : "-");
  const fmtWon = (n) =>
    n == null || isNaN(Number(n)) ? "-" : Number(n).toLocaleString("ko-KR") + "원";

  // ESC 닫기
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // (선택) loadUsage 제공 시에만 이력 로드
  useEffect(() => {
    let cancelled = false;
    async function boot() {
      if (!open || !voucherId || !loadUsage) return;
      setLoading(true);
      setErr("");
      try {
        const data = await loadUsage(voucherId); // 서버가 준비됐다면 여기서만 1회 호출
        if (cancelled) return;
        const rs = Array.isArray(data?.rows) ? data.rows : [];
        setRows(
          rs.map((r) => ({
            date: r.date ?? r.used_at ?? r.created_at,
            amount: r.amount ?? r.used_amount ?? r.price,
          }))
        );
        const tu =
          data?.totalUsed ??
          rs.reduce((s, r) => (isFinite(r.amount) ? s + Number(r.amount) : s), 0);
        setTotalUsed(tu);
      } catch (e) {
        if (!cancelled) setErr("사용 이력을 불러오지 못했습니다.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    boot();
    return () => {
      cancelled = true;
    };
  }, [open, voucherId, loadUsage]);
  
  useEffect(() => {
    if (!open || !voucher) return;
    setTotalUsed(voucher.total_used ?? voucher.usedAmount ?? 0);
}, [open, voucher]);

  if (!open || !voucher) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className={styles.close}
          onClick={onClose}
          aria-label="닫기"
          ref={firstFocusRef}
        >
          ×
        </button>

        <h2 className={styles.title}>금액권 사용 이력</h2>

        {err ? (
          <div className={styles.empty}>
            <div className={styles.emptyTitle}>오류</div>
            <div className={styles.emptyDesc}>{err}</div>
          </div>
        ) : (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              {/* <div className={styles.logo} aria-hidden /> */}
              <div className={styles.meta}>
                <div className={styles.voucherName}>{voucher.title || "바로팜 쿠폰"}</div>
                <div className={styles.expire}>{fmtRange(voucher.expiresAt)}</div>
              </div>
              <div className={styles.right}>
                <div className={styles.red}>남은 금액</div>
                <div className={styles.remain}>{fmtWon(voucher.remainingAmount)}</div>
              </div>
            </div>

            <div className={styles.table}>
              <div className={`${styles.tr} ${styles.head}`}>
                <div className={styles.td}>사용한 날짜</div>
                <div className={`${styles.td} ${styles.rightCell}`}>사용한 금액</div>
              </div>

              {loading ? (
                <div className={styles.noRows}>불러오는 중…</div>
              ) : rows.length === 0 ? (
                <div className={styles.noRows}>사용 이력이 없습니다.</div>
              ) : (
                rows.map((r, i) => (
                  <div className={styles.tr} key={i}>
                    <div className={styles.td}>{fmtDate(r.date)}</div>
                    <div className={`${styles.td} ${styles.rightCell}`}>
                      {fmtWon(r.amount)}
                    </div>
                  </div>
                ))
              )}

              <div className={styles.footerRows}>
                <div className={styles.kv}>
                  <span>총 사용 금액</span>
                  <strong>{fmtWon(totalUsed)}</strong>
                </div>
                <div className={styles.kv}>
                  <span>남은 금액</span>
                  <strong>{fmtWon(voucher.remainingAmount)}</strong>
                </div>
                <div className={styles.kv}>
                  <span>환불 가능 기간</span>
                  <strong>{fmtRange(voucher.refundableUntil)}</strong>
                </div>
              </div>
            </div>

            <div className={styles.actions}>
              <button className={styles.refundBtn} onClick={() => onClickRefund?.(voucherId)}>
                환불하기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
