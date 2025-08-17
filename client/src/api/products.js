// src/api/products.js
import API from "./index"; // axios 인스턴스 (토큰 자동 첨부)

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:3002/api";

/** AI 상세 설명 생성 */
export async function generateAIDescription(productId, keywordsOrOpts) {
  const url = `/s-products/${productId}/description/ai-gen`;

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
    const res = await API.post(url, body, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    });
    console.log("✅ [AI-GEN] res:", res.data);
    return res.data;
  } catch (err) {
    if (err.response) {
      console.group("❌ [AI-GEN] HTTP ERROR");
      console.log("status:", err.response.status);
      console.log("headers:", err.response.headers);
      console.log("data:", err.response.data);
      console.groupEnd();
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

    if (serverMsg?.includes("OPENAI_API_KEY")) {
      friendly = "서버 AI 설정(OPENAI_API_KEY)이 없습니다. 백엔드에 문의해주세요.";
    }

    const e = new Error(friendly);
    e.status = status;
    e.raw = err;
    throw e;
  }
}

/** ✅ 이미지 업로드 (multer 필드명 'images') */
export async function uploadProductImages(productId, files, fieldName = "images") {
  const formData = new FormData();
  files.forEach((f) => formData.append(fieldName, f));

  const { data } = await API.post(
    `/s-products/${productId}/images`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data; // { message, urls? }
}

/** 생성된 AI 설명 저장 (ai-save) */
export async function saveAIDescription(productId, description) {
  const url = `/s-products/${productId}/description/ai-save`;
  const body = { product_id: productId, description };

  console.log("📡 [AI-SAVE] POST", url, body);

  try {
    const res = await API.post(url, body, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    });
    console.log("✅ [AI-SAVE] res:", res.data);
    return res.data;
  } catch (err) {
    if (err.response) {
      console.group("❌ [AI-SAVE] HTTP ERROR");
      console.log("status:", err.response.status);
      console.log("headers:", err.response.headers);
      console.log("data:", err.response.data);
      console.groupEnd();
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

/** 상세 설명 직접 작성 저장 (manual) */
export async function saveManualDescription(productId, description) {
  const url = `/s-products/${productId}/description/manual`;
  const body = { product_id: productId, description };

  console.log("📡 [MANUAL] POST", url, body);

  try {
    const res = await API.post(url, body, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    });
    console.log("✅ [MANUAL] res:", res.data);
    return res.data;
  } catch (err) {
    if (err.response) {
      console.group("❌ [MANUAL] HTTP ERROR");
      console.log("status:", err.response.status);
      console.log("headers:", err.response.headers);
      console.log("data:", err.response.data);
      console.groupEnd();
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
