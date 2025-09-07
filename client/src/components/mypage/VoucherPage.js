import React from "react";
import s from "./VoucherPage.module.css";

// props.vouchers: [
//  { id, marketName, voucherName, imageUrl, expiresAt, usableAmount, refundableUntil }
// ]
export default function VoucherPage({
  vouchers = [],
  onClickUsage,       // (id) => ...
  onClickRefund,      // (id) => ...
}) {
  const fmtDate = (d) => (d ? `~${d} 까지` : "-");
  const fmtWon = (n) =>
    n == null || isNaN(Number(n)) ? "-" : Number(n).toLocaleString("ko-KR") + "원";

  return (
    <div className={s.wrap}>
      <div className={s.container}>
        <div className={s.headerRow}>
          <h1 className={s.title}>
            나의 금액권
          </h1>
          <div className={s.ai}>AI 챗봇</div>
        </div>
        <div className={s.hr} />

        {vouchers.length === 0 ? (
          <div className={s.empty}>
            <div className={s.emptyTitle}>보유 중인 금액권이 없어요</div>
            <div className={s.emptyDesc}>구매/발급 후 이곳에서 확인할 수 있어요.</div>
          </div>
        ) : (
          <ul className={s.list}>
            {vouchers.map((v) => (
              <li key={v.id} className={s.item}>
                <img src={v.imageUrl}    alt={v.marketName} className={s.logo} />

                <div className={s.main}>
                  <div className={s.row1}>
                    <span className= {s.market}> {v.marketName}  금액권</span>
                 
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
                      onClick={() => onClickUsage && onClickUsage(v.id)}
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
      </div>
    </div>
  );
}
