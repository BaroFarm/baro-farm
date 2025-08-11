// code.js
figma.showUI(__html__, { width: 420, height: 520 });

let storedToken = null;

// 플러그인 시작 시 저장된 토큰 불러와서 UI에 전달
(async function init() {
  try {
    storedToken = await figma.clientStorage.getAsync('authToken');
    figma.ui.postMessage({ type: 'prefill-token', token: storedToken || '' });
  } catch (e) {
    // 무시
  }
})();

const DEFAULT_LAYOUT = {
  page_title: "상품 상세페이지",
  canvas: { width: 500, padding: 16, bg: "#FFFFFF" },
  design_tokens: { spacing: { md: 16 }, radii: { lg: 12 } },
  sections: [
    { type: "hero", title: "상품명", subtitle: "상품 부제목", image: "https://picsum.photos/640/480" },
    { type: "text", body: "상품 설명이 없습니다." }
  ]
};

figma.ui.onmessage = async (msg) => {
  try {
    if (msg.type === "save-token") {
      const token = (msg.token || '').trim() || null;
      await figma.clientStorage.setAsync('authToken', token);
      storedToken = token;
      figma.notify(token ? "토큰 저장 완료" : "토큰 삭제됨");
      return;
    }

    if (msg.type === "generate-from-json") {
      var payloadA = msg && msg.payload ? msg.payload : {};
      var layout = (payloadA.layout !== undefined && payloadA.layout !== null) ? payloadA.layout : DEFAULT_LAYOUT;
      await buildFromLayout(layout);
      return;
    }

    if (msg.type === "generate-from-url") {
      var p = msg && msg.payload ? msg.payload : {};
      var url = p.url;
      var tokenInput = (p.token && p.token.trim()) || storedToken || "";
      if (!url) throw new Error("URL이 비어있습니다.");

      var authHeader = "";
      if (tokenInput) {
        authHeader = tokenInput.startsWith("Bearer ") ? tokenInput : ("Bearer " + tokenInput);
      }

      var opts = { headers: { "Cache-Control": "no-cache" } };
      if (authHeader) opts.headers["Authorization"] = authHeader;

      var res = await fetch(url, opts);
      if (!res.ok) throw new Error("요청 실패: " + res.status + " " + res.statusText);

      var json = await res.json();
      var layoutFromUrl = json && json.data ? json.data : json;

      // images 배열만 있는 경우 hero 섹션 생성
      if (layoutFromUrl.images && !layoutFromUrl.sections) {
        layoutFromUrl.sections = [{
          type: "hero",
          title: layoutFromUrl.title || "상품명 없음",
          subtitle: layoutFromUrl.intro || "",
          image: layoutFromUrl.images[0] || "https://picsum.photos/640/480"
        }];
      }

      // sections 보정
      if (layoutFromUrl.sections) {
        layoutFromUrl.sections = layoutFromUrl.sections.map(sec => {
            if (sec.type === "hero") {
              return {
                type: sec.type,
                title: sec.title,
                subtitle: sec.subtitle,
                image: sec.image || "https://picsum.photos/640/480"
              };
            }
            if (sec.type === "text") {
              return {
                type: sec.type,
                body: sec.body || "상품 설명이 없습니다."
              };
            }
            return sec;
          });
      }

      await buildFromLayout(layoutFromUrl);
      return;
    }
  } catch (e) {
    figma.notify("오류: " + (e && e.message ? e.message : String(e)));
  }
};

// 색상 HEX → RGB 변환
function hexToRgb01(hex) {
  var h = (hex || "#FFFFFF").replace("#", "");
  if (h.length === 3) h = h.split("").map(function (c) { return c + c; }).join("");
  var bigint = parseInt(h, 16);
  return { r: ((bigint >> 16) & 255) / 255, g: ((bigint >> 8) & 255) / 255, b: (bigint & 255) / 255 };
}

// 폰트 로드 (실패 시 Roboto Regular 대체)
async function ensureFont(family, style) {
  try {
    await figma.loadFontAsync({ family: family || "Roboto", style: style || "Regular" });
    return { family: family || "Roboto", style: style || "Regular" };
  } catch (e) {
    console.warn(`⚠️ 폰트 로드 실패: ${family} ${style}, 기본 폰트로 대체`);
    await figma.loadFontAsync({ family: "Roboto", style: "Regular" });
    return { family: "Roboto", style: "Regular" };
  }
}

// 레이아웃 빌드
async function buildFromLayout(layout) {
  var canvas = layout && layout.canvas ? layout.canvas : {};
  var design_tokens = layout && layout.design_tokens ? layout.design_tokens : {};

  var width = (typeof canvas.width === "number") ? canvas.width : 500;
  var pad = (canvas.padding === undefined || canvas.padding === null) ? 16 : canvas.padding;
  var bg = hexToRgb01(canvas.bg || "#FFFFFF");

  var spacing = (design_tokens.spacing && typeof design_tokens.spacing.md === "number") ? design_tokens.spacing.md : 16;
  var radius = (design_tokens.radii && typeof design_tokens.radii.lg === "number") ? design_tokens.radii.lg : 12;

  var root = figma.createFrame();
  root.name = (layout && layout.page_title) ? layout.page_title : "BaroFarm PDP";
  root.layoutMode = "VERTICAL";
  root.primaryAxisSizingMode = "AUTO";
  root.counterAxisSizingMode = "FIXED";
  root.resizeWithoutConstraints(width, 10);
  root.paddingLeft = pad; root.paddingRight = pad; root.paddingTop = pad; root.paddingBottom = pad;
  root.itemSpacing = spacing;
  root.fills = [{ type: "SOLID", color: bg }];
  root.cornerRadius = radius;

  var sections = (layout && layout.sections) ? layout.sections : [];
  for (var i = 0; i < sections.length; i++) {
    var section = sections[i];
    if (section.type === "hero") await renderHero(root, section, width, radius);
    else if (section.type === "text") await renderTextBlock(root, section);
  }

  figma.currentPage.appendChild(root);
  figma.viewport.scrollAndZoomIntoView([root]);
  figma.notify("상세페이지 생성 완료 ✨");
}

// Hero 섹션
async function renderHero(parent, section, width, radius) {
  var frame = figma.createFrame();
  frame.layoutMode = "VERTICAL";
  frame.primaryAxisSizingMode = "AUTO";
  frame.counterAxisSizingMode = "FIXED";
  frame.resizeWithoutConstraints(width - (parent.paddingLeft + parent.paddingRight), 10);
  frame.itemSpacing = 8;
  frame.fills = [];
  parent.appendChild(frame);

  if (section.image) {
    try {
      var image = await figma.createImageAsync(section.image);
      var size = await image.getSizeAsync();
      var targetW = frame.width;
      var scale = targetW / size.width;
      var targetH = Math.round(size.height * scale);

      var rect = figma.createRectangle();
      rect.resize(targetW, targetH);
      rect.cornerRadius = parent.cornerRadius;
      rect.fills = [{ type: "IMAGE", imageHash: image.hash, scaleMode: "FILL" }];
      frame.appendChild(rect);
    } catch (e) {
      figma.notify("이미지 로드 실패: " + (e && e.message ? e.message : String(e)));
    }
  }

  if (section.title) {
    const fontToUse = await ensureFont("Inter", "Bold");
    var t = figma.createText();
    t.fontName = fontToUse;
    t.characters = section.title;
    t.fontSize = 20;
    frame.appendChild(t);
  }

  if (section.subtitle) {
    const fontToUse = await ensureFont("Inter", "Regular");
    var s = figma.createText();
    s.fontName = fontToUse;
    s.characters = section.subtitle;
    s.opacity = 0.8;
    s.fontSize = 14;
    frame.appendChild(s);
  }
}

// 스타일링


// Text 섹션
async function renderTextBlock(parent, section) {
  if (!section.body) return;
  const fontToUse = await ensureFont("Inter", "Regular");
  var t = figma.createText();
  t.fontName = fontToUse;
  t.characters = section.body;
  t.fontSize = 13;
  t.lineHeight = { unit: "AUTO" };
  parent.appendChild(t);
}

async function renderDivider(parent) {
    const line = figma.createLine();
    line.resize(parent.width, 0); // 가로선
    line.strokes = [{ type: "SOLID", color: { r: 0.8, g: 0.8, b: 0.8 } }];
    line.strokeWeight = 1;
    parent.appendChild(line);
  }
  
  // Hero 섹션 (마켓컬리 스타일 변형)
  async function renderHero(parent, section, width, radius) {
    const frame = figma.createFrame();
    frame.layoutMode = "VERTICAL";
    frame.primaryAxisSizingMode = "AUTO";
    frame.counterAxisSizingMode = "FIXED";
    frame.resizeWithoutConstraints(width - (parent.paddingLeft + parent.paddingRight), 10);
    frame.itemSpacing = 10;
    frame.fills = [];
    parent.appendChild(frame);
  
    // 이미지
    if (section.image) {
      try {
        const image = await figma.createImageAsync(section.image);
        const size = await image.getSizeAsync();
        const targetW = frame.width;
        const scale = targetW / size.width;
        const targetH = Math.round(size.height * scale);
  
        const rect = figma.createRectangle();
        rect.resize(targetW, targetH);
        rect.cornerRadius = 12;
        rect.fills = [{ type: "IMAGE", imageHash: image.hash, scaleMode: "FILL" }];
        rect.effects = [{ type: "DROP_SHADOW", color: { r: 0, g: 0, b: 0, a: 0.1 }, offset: { x: 0, y: 4 }, radius: 8, visible: true, blendMode: "NORMAL" }];
        frame.appendChild(rect);
      } catch (e) {
        figma.notify("이미지 로드 실패: " + (e.message || e));
      }
    }
  
    // 타이틀 (좌측 정렬 유지)
    if (section.title) {
        const fontToUse = await ensureFont("Inter", "Bold");
        const s = figma.createText();
        s.fontName = fontToUse;
        s.characters = section.title;
        s.fontSize = 32; // ⬆ 크게
        s.fills = [{ type: "SOLID", color: { r: 0.18, g: 0.49, b: 0.20 } }];
    
        // 가로 전체 폭에 맞춰 중앙 정렬
        s.textAutoResize = "HEIGHT";
        s.resize(frame.width, s.height);
        s.textAlignHorizontal = "CENTER";
        s.layoutAlign = "STRETCH";
        frame.appendChild(s);
    
        // 상품명 아래 긴 가로선
        const line = figma.createLine();
        line.resize(frame.width, 0);        // 폭을 프레임 전체로
        line.strokes = [{ type: "SOLID", color: { r: 0.82, g: 0.82, b: 0.82 } }];
        line.strokeWeight = 1;
        frame.appendChild(line);
    }
  }
  
  
  // Body 텍스트 (가독성 높이기)
  async function renderTextBlock(parent, section) {
    if (!section.body) return;
    const fontToUse = await ensureFont("Inter", "Regular");
    const t = figma.createText();
    t.fontName = fontToUse;
    t.characters = section.body;
  
    t.fontSize = 14;                       // ⬇ 작게
    t.lineHeight = { unit: "PIXELS", value: 20 }; // ⬇ 행간 줄이기
    t.fills = [{ type: "SOLID", color: { r: 0.2, g: 0.2, b: 0.2 } }];
  
    // 읽기 좋게 가로 폭 맞추기 + 좌/우 여백 정렬
    t.textAutoResize = "HEIGHT";
    t.resize(parent.width, t.height);
    t.layoutAlign = "STRETCH";
    parent.appendChild(t);
  }
  
  
  // buildFromLayout 수정: divider 지원
  async function buildFromLayout(layout) {
    const canvas = layout.canvas || {};
    const width = canvas.width || 500;
    const pad = canvas.padding || 16;
    const bg = hexToRgb01(canvas.bg || "#FFFFFF");
  
    const root = figma.createFrame();
    root.name = layout.page_title || "BaroFarm PDP";
    root.layoutMode = "VERTICAL";
    root.primaryAxisSizingMode = "AUTO";
    root.counterAxisSizingMode = "FIXED";
    root.resizeWithoutConstraints(width, 10);
    root.paddingLeft = pad;
    root.paddingRight = pad;
    root.paddingTop = pad;
    root.paddingBottom = pad;
    root.itemSpacing = 16;
    root.fills = [{ type: "SOLID", color: bg }];
    root.cornerRadius = 12;
  
    for (const section of layout.sections || []) {
      if (section.type === "hero") {
        await renderHero(root, section, width, root.cornerRadius);
      } else if (section.type === "divider") {
        await renderDivider(root);
      } else if (section.type === "text") {
        await renderTextBlock(root, section);
      }
    }
  
    figma.currentPage.appendChild(root);
    figma.viewport.scrollAndZoomIntoView([root]);
    figma.notify("상세페이지 생성 완료 ✨");
  }