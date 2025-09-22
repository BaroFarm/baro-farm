const OpenAI = require("openai");
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

const MENU_ENUM = [
  "product","shipping","refund","order_payment","pre_ship_change",
  "product_search","product_seasonal","product_seasonal_list"
];

/* 휴리스틱 */
function routeByKeyword(message = "") {
  const m = (message || "").toLowerCase().trim();

  // 인사/짧은 반응
  if (/^(안녕|하이|ㅎㅇ|hello|hi|응|네|넵|ㅇㅇ|고마워|감사|땡큐|ㅎㅎ|ㅋㅋ)$/.test(m)) {
    return { mode: "answer", answer: "안녕하세요! 무엇을 도와드릴까요? 상단 메뉴를 눌러보세요." };
  }

  // 구매/주문 의도 → 검색으로 유도
  if (/(구매|구입|장바구니|담기|사려면|사는법|사고싶|사고 싶은)/.test(m)) {
    return { mode: "menu", menu_id: "product_search", params: {} };
  }

  // 주요 도메인
  if (/(배송|운송장|트래킹|도착|배달|수령)/.test(m)) return { mode: "menu", menu_id: "shipping", params: {} };
  if (/(환불|반품|취소)/.test(m))   return { mode: "menu", menu_id: "refund",   params: {} };
  if (/(결제|영수증|무통장|카드|쿠폰|포인트)/.test(m)) return { mode: "menu", menu_id: "order_payment", params: {} };
  if (/(주소|수량|수취인|변경|메모|바꾸고|수령인)/.test(m)) return { mode: "menu", menu_id: "pre_ship_change", params: {} };

  // 제철/월
  if (/(제철|이번달|이달|월별|월\s*추천)/.test(m)) {
    return { mode: "menu", menu_id: "product_seasonal", params: {} };
  }

  // 레시피/요리
  if (/(레시피|요리|만드는법|만드는 법|조리)/.test(m)) {
    return { mode: "menu", menu_id: "product_search", params: { keyword: message } };
  }

  // 카테고리 키워드
  const categories = {
    rice: /(쌀|잡곡|현미|백미|흑미|찹쌀|보리|귀리|콩|팥|수수|조|율무)/,
    vegetable: /(채소|야채|버섯|상추|시금치|배추|양배추|당근|오이|토마토|감자|고구마|양파|마늘|파|고추|표고|새송이|팽이|느타리)/,
    fruit: /(과일|견과|사과|배|귤|감귤|포도|딸기|수박|참외|복숭아|자두|블루베리|체리|호두|아몬드|땅콩|캐슈넛|잣)/,
    meat: /(축산|축산가공|고기|쇠고기|소고기|한우|돼지고기|삼겹살|목살|갈비|불고기|돈까스|닭고기|닭|오리고기|오리|양고기|햄|소시지|베이컨)/,
    fish: /(수산|수산물|생선|해산물|고등어|갈치|명태|연어|참치|전어|조기|새우|오징어|문어|낙지|꽃게|바지락|홍합|전복|미역|다시마)/
  };
  for (const rx of Object.values(categories)) {
    if (rx.test(m)) return { mode: "menu", menu_id: "product", params: { keyword: message } };
  }

  // 일반 상품 키워드
  if (/(상품|재고|원산지|유통기한|보관|검색)/.test(m)) {
    return { mode: "menu", menu_id: "product", params: { keyword: message } };
  }

  return { mode: "unknown" };
}

/* LLM 보조: 휴리스틱 실패 시만 호출 */
async function routeWithLLM(message) {
  if (!openai) {
    const h = routeByKeyword(message);
    if (h.mode === "unknown") {
      return { mode: "answer", answer: "현재 답변을 준비하지 못했습니다. 고객센터(☎ 1588-0000)로 문의 부탁드립니다." };
    }
    return h;
  }

  const h = routeByKeyword(message);
  if (h.mode !== "unknown") return h;

  try {
    const r = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: "로컬푸드 이커머스 챗봇 라우터. 질문을 메뉴(product/shipping/refund/order_payment/pre_ship_change/product_search/product_seasonal)로 분류하거나 간단 답변한다." },
        { role: "user", content: String(message || "") }
      ]
    });

    const txt = r.choices?.[0]?.message?.content?.trim() || "";
    const h2 = routeByKeyword(txt || message);
    if (h2.mode !== "unknown") return h2;

    return { mode: "answer", answer: "현재 답변을 준비하지 못했습니다. 고객센터(☎ 1588-0000)로 문의 부탁드립니다." };
  } catch {
    return { mode: "answer", answer: "현재 답변을 준비하지 못했습니다. 고객센터(☎ 1588-0000)로 문의 부탁드립니다." };
  }
}

module.exports = { routeWithLLM };
