// controllers/chatbot/menus.js
const { ok } = require("./utils");

/* --- 링크 헬퍼 (프론트 라우터 경로와 연결) --- */
const toOrders      = () => "/api/my/orders";                 // 주문 내역 
const toRefunds     = () => "/api/my/cancel";                 // 환불/반품 내역 
const toSearch      = (q) => `/api/products${q ? `?query=${encodeURIComponent(q)}` : ""}`; // 상품 페이지
const seasonalPage  = () => "/api/products/seasonal";     // 제철 상품 페이지

/* --- 제철 상품 데이터 --- */
const SEASONAL = {
  1: ["귤","레몬","우엉","연근","당근","굴","문어","해삼","대구","명태","도미","옥돔","아귀","가자미"],
  2: ["딸기","귤","레몬","한라봉","쑥갓","시금치","고비","봄동","참취","순무","양파","달래","청각","다시마","파래","전복","굴","꼬막","홍어","홍합"],
  3: ["딸기","한라봉","우엉","냉이","더덕","취나물","쑥","씀바귀","돌미나리","바지락","꼬막","주꾸미","도미","소라","멸치"],
  4: ["딸기","달래","냉이","두릅","더덕","취나물","쑥","상추","봄동","아스파라거스","미더덕","소라","도기","조기","뱅어포","병어","키조개","김","갈치","고등어","꽃게","주꾸미"],
  5: ["딸기","매실","앵두","하귤","두릅","취나물","양배추","고구마순","상추","파","양파","마늘","더덕","마늘종","완두","미나리","도라지","멍게","참치","홍어","넙치","오징어","준치"],
  6: ["토마토","참외","매실","복분자","하귤","수박","감자","샐러리","껍질콩","양파","근대","부추","청동호박","장어","다슬기","참다랑어","소라","흑돔","병어","준치","삼치","전갱이","오징어","바닷가재"],
  7: ["수박","딸기","참외","산딸기","자두","아보카도","배","사과","포도","석류","무화과","블루베리","복숭아","복분자","부추","양배추","가지","피망","애호박","노각","열무","감자","토마토","도라지","옥수수","장어","홍어","농어","갑오징어","병어"],
  8: ["멜론","복숭아","포도","수박","블루베리","참외","자두","오이","풋고추","열무","양상추","깻잎","감자","고구마순","옥수수","전복","성게","잉어","장어","전갱이"],
  9: ["배","귤","석류","블루베리","사과","포도","수박","무화과","고구마","감자","풋콩","토란","느타리버섯","당근","붉은고추","표고버섯","옥수수","부추","해파리","굴","게","고등어","대하","전복","갈치","광어"],
  10:["배","귤","석류","사과","감","밤","대추","송이버섯","고추","팥","무","느타리버섯","양송이버섯","고들빼기","고구마","늙은호박","꽁치","고등어","청어","갈치","연어","대하","홍합","굴","게","전복","삼치","광어","해삼"],
  11:["배","사과","귤","키위","배추","무","연근","당근","우엉","파","늙은호박","은행","유자","브로콜리","삼치","도미","광어","해삼","과메기","꽃게","방어","옥돔","연어","참치","참돔","대구","성게","오징어"],
  12:["귤","바나나","유자","사과","한라봉","콜리플라워","산마","배추","무","브로콜리","명태","아귀","도미","가리비","광어","과메기","굴","홍합","꼬막","대하","삼치"]
};
const thisMonth = () => new Date().getMonth() + 1;
const monthList = Array.from({ length: 12 }, (_, i) => i + 1);

//
// ---------------- 상품 ----------------
//
async function product(params = {}, user) {
  const { keyword, category } = params || {};

  if (keyword || category) {
    const q = keyword || category;
    return ok(
      `‘${q}’ 관련 상품을 검색해 보세요.`,
      [],
      [{ label: "상품 검색하러 가기", menu_id: "product_search", params: { keyword: q } }]
    );
  }

  return ok(
    "상품 관련 어떤 내용을 확인하시겠어요?",
    [],
    [
      { label: "재고 확인",          menu_id: "product_stock"   },
      { label: "원산지",            menu_id: "product_origin"  },
      { label: "유통기한/보관 방법", menu_id: "product_expiry"  },
      { label: "상품 검색하기",      menu_id: "product_search"  },
      { label: "제철 상품 추천",     menu_id: "product_seasonal"}
    ]
  );
}

/* 재고 */
async function product_stock(params = {}, user) {
  const q = params.keyword || "";
  return ok(
    "재고 확인은 상품 상세 또는 검색 결과에서 가능합니다.",
    [],
    [{ label: "상품 검색하러 가기", menu_id: "product_search", params: { keyword: q } }]
  );
}

/* 원산지 */
async function product_origin(params = {}, user) {
  const q = params.keyword || "";
  return ok(
    "원산지는 각 상품 상세에 표시돼요.",
    [],
    [{ label: "상품 검색하러 가기", menu_id: "product_search", params: { keyword: q } }]
  );
}

/* 유통기한/보관 */
async function product_expiry(params = {}, user) {
  const q = params.keyword || params.category || "";
  const tips = [
    { k: "채소/과일", v: "실온 1~3일, 냉장 3~7일. 통풍·저온 보관 권장." },
    { k: "육류",     v: "냉장 3~5일, 냉동 2~3개월. 밀봉 보관." },
    { k: "수산",     v: "냉장 1~2일, 냉동 1~2개월. 재냉동 지양." },
    { k: "유제품",   v: "개봉 후 3~5일 내 섭취, 0~4℃ 보관." },
    { k: "쌀/잡곡",  v: "서늘·건조 밀폐, 여름철 냉장 권장." }
  ];
  return ok(
    "유통기한/보관 방법은 상품 상세에서 확인해 주세요. 아래는 일반 가이드입니다.",
    [{ type: "tips", items: tips }],
    [{ label: "상품 검색하러 가기", menu_id: "product_search", params: { keyword: q } }]
  );
}

/* 검색 */
async function product_search(params = {}, user) {
  const q = params.keyword || params.category || "";
  return ok("상품 검색 페이지로 이동합니다.", [
    { type: "link", url: toSearch(q), label: "검색 페이지 열기" }
  ]);
}

/* 제철 상품 루트 */
async function product_seasonal(params = {}, user) {
  const cur = thisMonth();
  return ok(
    "제철 상품을 보실 수 있어요. 페이지로 이동하거나 월을 선택하세요.",
    [{ type: "link", url: seasonalPage(), label: "제철 상품 페이지 이동" }],
    [
      { label: "이번 달 보기", menu_id: "product_seasonal_list", params: { month: "current" } },
      ...monthList.map(m => ({ label: `${m}월 보기`, menu_id: "product_seasonal_list", params: { month: m } }))
    ]
  );
}

/* 제철 목록 */
async function product_seasonal_list(params = {}, user) {
  let { month } = params || {};
  if (month === "current" || !month) month = thisMonth();
  month = Number(month);

  const items = SEASONAL[month] || [];
  const text = items.length
    ? `${month}월 제철 상품입니다:\n${items.map(x => `- ${x}`).join("\n")}`
    : `${month}월 제철 상품 정보를 찾지 못했습니다.`;

  return ok(
    text,
    [{ type: "link", url: seasonalPage(), label: "제철 상품 페이지 이동" }],
    [{ label: "상품 검색하기", menu_id: "product_search" }]
  );
}

//
// ---------------- 배송 ----------------
//
async function shipping(params = {}, user) {
  return ok(
    "배송 관련 어떤 작업을 하시겠어요?",
    [],
    [
      { label: "배송 현황 확인", menu_id: "shipping_status" },
      { label: "배송지 변경",   menu_id: "shipping_change_address" },
      { label: "배송 메모 변경", menu_id: "shipping_change_memo" },
      { label: "주문 내역 보기", menu_id: "orders_page" }
    ]
  );
}

async function shipping_status(params = {}, user) {
  const { order_id } = params || {};

  if (!user) {
    return ok(
      "로그인 후 주문을 선택해 배송 현황을 확인할 수 있어요.",
    );
  }

  if (!order_id) {
    return ok("배송 현황은 주문 상세에서 확인할 수 있어요.", [
      { type: "link", url: toOrders(), label: "주문 선택하러 가기" }
    ]);
  }

  return ok(
    `주문 ${order_id}의 배송 상태는 주문 상세에서 확인하세요.`,
    [{ type: "link", url: `${toOrders()}?order_id=${encodeURIComponent(order_id)}`, label: "주문 상세 열기" }]
  );
}

async function shipping_change_address(params = {}, user) {
  const { order_id } = params || {};

  if (!user) {
    return ok(
      "로그인 후 배송지 변경을 요청할 수 있어요.",
    );
  }

  if (!order_id) {
    return ok("배송지 변경은 주문 상세에서 가능합니다.", [
      { type: "link", url: toOrders(), label: "주문 선택하러 가기" }
    ]);
  }
  return ok(`주문 ${order_id}의 배송지 변경 요청을 접수합니다.`, [
    { type: "link", url: `${toOrders()}?order_id=${encodeURIComponent(order_id)}`, label: "주문 상세 열기" }
  ]);
}

async function shipping_change_memo(params = {}, user) {
  const { order_id } = params || {};

  if (!user) {
    return ok(
      "로그인 후 배송 메모 변경을 요청할 수 있어요.",
    );
  }

  if (!order_id) {
    return ok("배송 메모 변경은 주문 상세에서 가능합니다.", [
      { type: "link", url: toOrders(), label: "주문 선택하러 가기" }
    ]);
  }
  return ok(`주문 ${order_id}의 배송 메모 변경 요청을 접수합니다.`, [
    { type: "link", url: `${toOrders()}?order_id=${encodeURIComponent(order_id)}`, label: "주문 상세 열기" }
  ]);
}

async function orders_page(params = {}, user) {
  if (!user) {
    return ok(
      "주문 내역은 로그인 후 이용할 수 있어요.",
    );
  }
  return ok("주문 내역으로 이동합니다.", [
    { type: "link", url: toOrders(), label: "주문 내역 보러 가기" }
  ]);
}

//
// ---------------- 환불 ----------------
//
async function refund(params = {}, user) {
  return ok(
    "환불/반품 관련 어떤 작업을 하시겠어요?",
    [],
    [
      { label: "환불/반품 정책",     menu_id: "refund_policy" },
      { label: "환불 요청하기",       menu_id: "refund_request" },
      { label: "수거 일정 안내",      menu_id: "refund_pickup" },
      { label: "환불 진행 상태 확인",  menu_id: "refund_status" }
    ]
  );
}

async function refund_policy(params = {}, user) {
  return ok("신선식품은 특정 상품에 한해 수령 후 24시간 이내 품질 문제 시 환불/반품 가능합니다. 가능 여부는 해당 상품 상세에서 확인해주세요.");
}

async function refund_request(params = {}, user) {
  if (!user) {
    return ok(
      "로그인 후 환불 요청을 접수할 수 있어요.",
    );
  }
  return ok("환불 요청은 마이페이지에서 주문을 선택해 접수해 주세요.", [
    { type: "link", url: toRefunds(), label: "환불/반품 내역 보러 가기" }
  ]);
}

async function refund_pickup(params = {}, user) {
  if (!user) {
    return ok(
      "로그인 후 환불/반품 수거 일정을 확인할 수 있어요.",
    );
  }
  return ok("수거 일정은 환불 접수 후 택배사에서 안내드려요.", [
    { type: "link", url: toRefunds(), label: "환불/반품 내역 보러 가기" }
  ]);
}

async function refund_status(params = {}, user) {
  if (!user) {
    return ok(
      "로그인 후 환불 진행 상태를 확인할 수 있어요.",
    );
  }
  return ok("환불 진행 상태는 마이페이지에서 확인할 수 있어요.", [
    { type: "link", url: toRefunds(), label: "환불/반품 내역 보러 가기" }
  ]);
}

//
// ---------------- 주문/결제 ----------------
//
async function order_payment(params = {}, user) {
  return ok(
    "주문/결제 관련 어떤 작업을 하시겠어요?",
    [],
    [
      { label: "결제 수단 안내",  menu_id: "payment_methods" },
      { label: "무통장입금 안내", menu_id: "payment_deposit" },
      { label: "주문 내역 보기",  menu_id: "orders_page" }
    ]
  );
}

async function payment_methods(params = {}, user) {
  return ok("지원 결제수단: 무통장입금, 카드, 간편결제(플랫폼별 상이).");
}

async function payment_deposit(params = {}, user) {
  return ok([
    "무통장입금 안내입니다.",
    "- 입금기한: 주문 후 24시간 이내 미입금 시 자동 취소됩니다.",
    "- 입금자명/입금액이 주문정보와 일치해야 자동 확인됩니다.",
    "- 계좌정보는 결제 과정에서 확인할 수 있어요."
  ].join("\n"));
}

//
// ---------------- 디스패처 ----------------
//
async function handleMenu(menu_id, params = {}, user) {
  switch (menu_id) {
    // 상품
    case "product":               return product(params, user);
    case "product_stock":         return product_stock(params, user);
    case "product_origin":        return product_origin(params, user);
    case "product_expiry":        return product_expiry(params, user);
    case "product_search":        return product_search(params, user);
    case "product_seasonal":      return product_seasonal(params, user);
    case "product_seasonal_list": return product_seasonal_list(params, user);

    // 배송
    case "shipping":               return shipping(params, user);
    case "shipping_status":        return shipping_status(params, user);
    case "shipping_change_address":return shipping_change_address(params, user);
    case "shipping_change_memo":   return shipping_change_memo(params, user);
    case "orders_page":            return orders_page(params, user);

    // 환불
    case "refund":                 return refund(params, user);
    case "refund_policy":          return refund_policy(params, user);
    case "refund_request":         return refund_request(params, user);
    case "refund_pickup":          return refund_pickup(params, user);
    case "refund_status":          return refund_status(params, user);

    // 주문/결제
    case "order_payment":          return order_payment(params, user);
    case "payment_methods":        return payment_methods(params, user);
    case "payment_deposit":        return payment_deposit(params, user);

    // 배송 전 변경 (→ 배송 메뉴 재사용)
    case "pre_ship_change":        return shipping(params, user);

    default:
      return ok("지원하지 않는 메뉴입니다.");
  }
}

module.exports = { handleMenu };
