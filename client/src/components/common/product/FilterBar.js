// src/components/common/filters/FilterBar.jsx
import React from "react";

const box = { display: "flex", gap: 8, alignItems: "center", margin: "12px 0 20px" };
const sel = { padding: "8px 10px", borderRadius: 8, border: "1px solid #d0d0d0" };

export default function FilterBar({ region = "", storeId = "", partner = "", onChange }) {
  // 임시 옵션 (나중에 API로 교체)
  const regions = ["", "수원", "용인", "성남", "고양", "의정부", "남양주", "부천", "평택"];
  const stores  = [
    { id: "", name: "전체 직매장" },
    { id: "1", name: "로컬푸드 직매장" },
    { id: "2", name: "성수직매장" },
  ];
  const partnerOptions = [
    { value: "", label: "전체" },
    { value: "Y", label: "제휴 상품만" },
    { value: "N", label: "제휴 제외" },
  ];

  return (
    <div style={box}>
      <label>
        <span style={{ marginRight: 6 }}>지역별</span>
        <select
          style={sel}
          value={region}
          onChange={(e) => onChange?.({ region: e.target.value })}
        >
          <option value="">전체 지역</option>
          {regions.map((r) => (
            <option key={r || "all"} value={r}>{r || "전체"}</option>
          ))}
        </select>
      </label>

      <label>
        <span style={{ margin: "0 6px 0 12px" }}>직매장별</span>
        <select
          style={sel}
          value={storeId}
          onChange={(e) => onChange?.({ storeId: e.target.value })}
        >
          {stores.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </label>

      <label>
        <span style={{ margin: "0 6px 0 12px" }}>제휴 상품</span>
        <select
          style={sel}
          value={partner}
          onChange={(e) => onChange?.({ partner: e.target.value })}
        >
          {partnerOptions.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </label>

      <button
        style={{ marginLeft: 12, padding: "8px 12px", borderRadius: 8, border: "1px solid #ccc", background: "#fff" }}
        onClick={() => onChange?.({ region: "", storeId: "", partner: "" })}
      >
        초기화
      </button>
    </div>
  );
}
