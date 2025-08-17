// src/api/products.js
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:3002/api";

// 공통 헤더(선택): 로컬스토리지에 토큰이 있으면 Bearer 자동 부착
function getAuthHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** AI 상세 설명 생성
 *  - 기존: (productId, keywords)
 *  - 추가 지원: (productId, { keywords, prompt }) 형태도 허용 (기존 코드와 100% 호환)
 *  - 반환 값은 기존처럼 res.data 그대로 반환 (하위 코드 안 깨짐)
 */
export async function generateAIDescription(productId, keywordsOrOpts) {
  const url = `${API_BASE}/s-products/${productId}/description/ai-gen`;

  // ✅ 바디 스키마 호환 처리
  let body = { product_id: productId };
  if (Array.isArray(keywordsOrOpts)) {
    body.keywords = keywordsOrOpts;
  } else if (keywordsOrOpts && typeof keywordsOrOpts === "object") {
    const { keywords, prompt } = keywordsOrOpts;
    if (keywords) body.keywords = keywords;
    if (prompt) body.prompt = prompt;
  }

  console.log("📡 [AI-GEN] POST", url, body);

  try {
    const res = await axios.post(url, body, {
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      withCredentials: true, // ✅ 기존 유지
    });
    console.log("✅ [AI-GEN] res:", res.data);

    // ✅ 하위 호환: 기존처럼 res.data 그대로 반환
    // (필요시 이 주석 해제해서 문자열만 뽑아쓰는 것도 가능)
    // const d = res.data;
    // if (d?.data?.description) return d; // 서버가 { data: { description } } 형태일 때
    // if (d?.generatedDescription) return d;
    // return d;

    return res.data;
  } catch (err) {
    if (err.response) {
      console.group("❌ [AI-GEN] HTTP ERROR");
      console.log("status:", err.response.status);
      console.log("headers:", err.response.headers);
      console.log("data:", err.response.data);
      console.groupEnd();
    } else if (err.request) {
      console.error("❌ [AI-GEN] 요청은 갔지만 응답 없음:", err.request);
    } else {
      console.error("❌ [AI-GEN] 요청 설정 중 에러:", err.message);
    }

    const status = err.response?.status;
    const serverMsg = err.response?.data?.message;

    let friendly =
      serverMsg ||
      (status === 400 && "키워드를 입력해주세요.") ||
      (status === 401 && "로그인이 필요합니다.") ||
      (status === 403 && "판매자만 접근할 수 있습니다.") ||
      (status === 500 && "AI 설명 생성 실패") ||
      "요청 처리 중 오류가 발생했습니다.";

    // 백엔드에서 OpenAI 설정 누락 시 전달해주는 메시지를 사용자 친화적으로 변환
    if (serverMsg?.includes("AI 설정이 올바르지 않습니다") || serverMsg?.includes("OPENAI_API_KEY")) {
      friendly = "서버 AI 설정(OPENAI_API_KEY)이 없습니다. 백엔드에 문의해주세요.";
    }

    const e = new Error(friendly);
    e.status = status;
    e.raw = err;
    throw e;
  }
}

/** ✅ 추가: 이미지 업로드 (multer 필드명 'images') */
export async function uploadProductImages(productId, files, fieldName = "images") {
  const formData = new FormData();
  files.forEach((f) => formData.append(fieldName, f)); // 순서 = img_order

  const { data } = await axios.post(
    `${API_BASE}/s-products/${productId}/images`,
    formData,
    {
      headers: { ...getAuthHeaders() }, // Content-Type은 브라우저가 자동 지정
      withCredentials: true,
    }
  );
  return data; // { message, urls? }
}

/** 생성된 AI 설명 저장 (ai-save) — 기존 동작 유지 */
export async function saveAIDescription(productId, description) {
  const url = `${API_BASE}/s-products/${productId}/description/ai-save`;
  const body = { product_id: productId, description };

  console.log("📡 [AI-SAVE] POST", url, body);

  try {
    const res = await axios.post(url, body, {
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      withCredentials: true, // ✅ 기존 유지
    });
    console.log("✅ [AI-SAVE] res:", res.data);
    return res.data; // { message: "AI 설명이 저장되었습니다." }
  } catch (err) {
    if (err.response) {
      console.group("❌ [AI-SAVE] HTTP ERROR");
      console.log("status:", err.response.status);
      console.log("headers:", err.response.headers);
      console.log("data:", err.response.data);
      console.groupEnd();
    } else if (err.request) {
      console.error("❌ [AI-SAVE] 요청은 갔지만 응답 없음:", err.request);
    } else {
      console.error("❌ [AI-SAVE] 요청 설정 중 에러:", err.message);
    }

    const status = err.response?.status;
    const serverMsg = err.response?.data?.message;

    const friendly =
      serverMsg ||
      (status === 404 && "상품을 찾을 수 없습니다.") ||
      (status === 400 && "설명을 전달받지 못했습니다.") ||
      (status === 401 && "로그인이 필요합니다.") ||
      (status === 403 && "판매자만 접근할 수 있습니다.") ||
      "설명 저장 실패";

    const e = new Error(friendly);
    e.status = status;
    e.raw = err;
    throw e;
  }
}

/** 상세 설명 직접 작성 저장 (manual) — 기존 동작 유지 */
export async function saveManualDescription(productId, description) {
  const url = `${API_BASE}/s-products/${productId}/description/manual`;
  const body = { product_id: productId, description };

  console.log("📡 [MANUAL] POST", url, body);

  try {
    const res = await axios.post(url, body, {
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      withCredentials: true, // ✅ 기존 유지
    });
    console.log("✅ [MANUAL] res:", res.data);
    return res.data; // { message: "설명이 성공적으로 저장되었습니다." }
  } catch (err) {
    if (err.response) {
      console.group("❌ [MANUAL] HTTP ERROR");
      console.log("status:", err.response.status);
      console.log("headers:", err.response.headers);
      console.log("data:", err.response.data);
      console.groupEnd();
    } else if (err.request) {
      console.error("❌ [MANUAL] 요청은 갔지만 응답 없음:", err.request);
    } else {
      console.error("❌ [MANUAL] 요청 설정 중 에러:", err.message);
    }

    const status = err.response?.status;
    const serverMsg = err.response?.data?.message;

    const friendly =
      serverMsg ||
      (status === 401 && "로그인이 필요합니다.") ||
      (status === 403 && "판매자만 접근할 수 있습니다.") ||
      "설명 저장 실패";

    const e = new Error(friendly);
    e.status = status;
    e.raw = err;
    throw e;
  }
}
