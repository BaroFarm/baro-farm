const { Product, ProductImg } = require('../../models');
const cloudinary = require('cloudinary').v2;
const puppeteer = require('puppeteer');

// g/kg 단위 포맷터
function formatWeight(raw) {
  if (raw == null) return '';
  const s = String(raw).trim();

  // 이미 단위가 붙어 있으면 그대로 사용
  if (/\b(kg|g)\b/i.test(s)) return s.replace(/\s+/g, '');

  // 숫자일 때: g 기준으로 해석 (BaroFarm DB가 g 정수인 케이스 대응)
  const n = Number(s);
  if (!isFinite(n)) return '';

  if (n >= 1000) {
    // 1000g 이상이면 kg로 변환 (소수점 한 자리, 딱 떨어지면 .0 제거)
    const kg = n / 1000;
    const kgStr = (kg % 1 === 0) ? String(kg) : kg.toFixed(1);
    return `${kgStr}kg`;
  }
  return `${n}g`;
}



function toAbs(req, u = '') {
  if (!u) return '';
  if (/^https?:\/\//i.test(u)) return u;
  const serverOrigin = `${req.protocol}://${req.get('host')}`;
  if (u.startsWith('/')) return serverOrigin + u;
  return `${serverOrigin}/${u}`;
}

// Cloudinary URL에 변환 파라미터 삽입
function toCdn(u, { w, h, fill = true } = {}) {
  if (!u || !/^https?:\/\/res\.cloudinary\.com\//.test(u)) return u;
  const parts = u.split('/upload/');
  if (parts.length !== 2) return u;
  const mode = fill ? 'c_fill' : 'c_fit';
  const tr = ['f_auto', 'q_auto', mode];
  if (w) tr.push(`w_${w}`);
  if (h) tr.push(`h_${h}`);
  return `${parts[0]}/upload/${tr.join(',')}/${parts[1]}`;
}

// 소개글에서 간단 토큰 추출
function preprocessProduct(product) {
  const title = (product.title || '').trim() || '상품명 없음';
  const intro = (product.intro || '').trim();
  const desc = (product.description || '').trim();

  const text = [title, intro, desc].join(' ').replace(/\s+/g, ' ').trim();

  const bx = (text.match(/(\d{1,2}(?:\.\d)?)\s*°?\s*Bx/i) || [])[1];
const kg = (text.match(/(\d+(?:\.\d+)?)\s*(?:kg|킬로|키로)\b/i) || [])[1];
const g  = (text.match(/(\d{2,6})\s*g\b/i) || [])[1];

let weight = '';
if (kg) {
  weight = `${kg}kg`;
} else if (g) {
  weight = `${g}g`;
} else if (product.weight != null) {
  // DB 값이 숫자(예: 500) 또는 "500"이라면 g로 보고 포맷
  weight = formatWeight(product.weight);
}

  // 라벨/배지 후보
  const badges = [];
  const trust = [];

  // 산지/재배/인증 키워드

  // 중복 방지 유틸
const seen = { badge: new Set(), trust: new Set() };
const pushBadge = (s) => { if (s && !seen.badge.has(s)) { badges.push(s); seen.badge.add(s); } };
const pushTrust = (icon, label) => {
  if (!label) return;
  const key = `${icon}:${label}`;
  if (!seen.trust.has(key)) { trust.push({ icon, label }); seen.trust.add(key); }
};

const CERT_MODE = 'badges_only';

// ── 경기도 산지 한정
let matchedGyeonggiCity = false;
if (/수원/i.test(text)) { pushTrust('pin', '산지: 수원'); matchedGyeonggiCity = true; }
if (/용인/i.test(text)) { pushTrust('pin', '산지: 용인'); matchedGyeonggiCity = true; }
if (/이천/i.test(text)) { pushTrust('pin', '산지: 이천'); matchedGyeonggiCity = true; }
if (/광주/i.test(text)) { pushTrust('pin', '산지: 광주(경기)'); matchedGyeonggiCity = true; }
if (/평택/i.test(text)) { pushTrust('pin', '산지: 평택'); matchedGyeonggiCity = true; }
if (/포천/i.test(text)) { pushTrust('pin', '산지: 포천'); matchedGyeonggiCity = true; }
if (/안성/i.test(text)) { pushTrust('pin', '산지: 안성'); matchedGyeonggiCity = true; }
if (/여주/i.test(text)) { pushTrust('pin', '산지: 여주'); matchedGyeonggiCity = true; }
if (/김포/i.test(text)) { pushTrust('pin', '산지: 김포'); matchedGyeonggiCity = true; }
if (/파주/i.test(text)) { pushTrust('pin', '산지: 파주'); matchedGyeonggiCity = true; }
if (/양평/i.test(text)) { pushTrust('pin', '산지: 양평'); matchedGyeonggiCity = true; }

// 시가 하나도 안 잡혔고 "경기도/경기"가 있으면 도 단위로 표시
if (!matchedGyeonggiCity && /(경기도|경기)\b/i.test(text)) {
  pushTrust('pin', '산지: 경기도');
}

// ── 재배/인증 키워드 (중복 금지 + 정책 적용)
const certFound = {
  nonpesticide: /무농약/i.test(text),
  organic: /(유기농|유기)\b/i.test(text),
  gap: /\bGAP\b/i.test(text),
  eco: /친환경/i.test(text),
  lowcarbon: /저탄소/i.test(text),
};

if (CERT_MODE === 'badges_only') {
  if (certFound.nonpesticide) pushBadge('무농약');
  if (certFound.organic)      pushBadge('유기농');
  if (certFound.gap)          pushBadge('GAP');
  if (certFound.eco)          pushBadge('친환경');
  if (certFound.lowcarbon)    pushBadge('저탄소');
} else if (CERT_MODE === 'trust_only') {
  if (certFound.nonpesticide) pushTrust('leaf', '무농약 인증');
  if (certFound.organic)      pushTrust('leaf', '유기농 인증');
  if (certFound.gap)          pushTrust('leaf', 'GAP 인증');
  if (certFound.eco)          pushTrust('leaf', '친환경 재배');
  if (certFound.lowcarbon)    pushTrust('leaf', '저탄소 인증');
} else if (CERT_MODE === 'both_summary') {
  // 배지에는 개별 표시, trust에는 요약 1줄만
  const anyCert = Object.values(certFound).some(Boolean);
  if (certFound.nonpesticide) pushBadge('무농약');
  if (certFound.organic)      pushBadge('유기농');
  if (certFound.gap)          pushBadge('GAP');
  if (certFound.eco)          pushBadge('친환경');
  if (certFound.lowcarbon)    pushBadge('저탄소');
  if (anyCert) pushTrust('leaf', '재배 인증');
}

// ── 당도(Bx)는 배지 + trust 모두에 쓰되, 중복 방지
if (bx) {
  pushBadge(`${bx}브릭스`);
  pushTrust('thermo', `당도 ${bx}Bx`);
}

// 보관 키워드
let storage = '';
if (/냉장|0\s*~?\s*5\s*℃|섭씨\s*0|신선보관/i.test(text)) {
  storage = '0–5℃ 냉장 보관';
} else if (/냉동|−18|영하\s*18/i.test(text)) {
  storage = '−18℃ 냉동 보관';
} else if (/상온|서늘한 곳|직사광선.*피/i.test(text)) {
  storage = '서늘한 상온 보관';
}

// 활용 키워드
const uses = [];
if (/샐러드|토핑/i.test(text)) uses.push('샐러드 토핑');
if (/마말레이드|잼|쨈/i.test(text)) uses.push('마말레이드/잼');
if (/생과|그대로|간식/i.test(text)) uses.push('생과/간식');
if (/주스|청|에이드/i.test(text)) uses.push('주스/청/에이드');
if (/볶음|조림|국|탕/i.test(text)) uses.push('조리용');
if (/선물|답례품/i.test(text)) uses.push('선물/답례품');

// 핵심 한 줄(길이 제한)
const headlineCandidates = [intro, desc].filter(Boolean);
let headline = headlineCandidates.find(s => s.length <= 28) || title;
if (headline.length > 28) headline = headline.slice(0, 28) + '…';

let sub = '';
// 원산지(경기도/시군) 후보가 있으면 사용 → 없으면 무게 → 그 외 비움
const originCandidate =
  (/(경기도|경기)\b/i.test(text) && '경기도') ||
  (/수원|용인|이천|광주|평택|포천|안성|여주|김포|파주|양평/i.test(text) && '경기도 산지');

if (originCandidate) sub = originCandidate;
else if (weight) sub = weight;

// 하이라이트 칩(키워드)
const highlights = [];
if (/과즙|달콤|새콤|상큼|아삭|고소|담백/i.test(text)) highlights.push('풍미/식감');
if (/껍질.*얇|박피.*용이|씨.*적/i.test(text)) highlights.push('껍질 얇음/씨 적음');
if (/선별|당도.*선별|크기.*선별/i.test(text)) highlights.push('선별 출고');
if (/영양|비타민|무기질/i.test(text)) highlights.push('영양 풍부');
if (/직송|산지직송|당일 수확/i.test(text)) highlights.push('산지 직송');

  // 반품 라벨
  if (product.returnable === false || /반품\s*불가/i.test(text)) badges.push('반품 불가');

  return {
    title,
    subtitle: intro,
    body: desc || '상품 설명이 없습니다.',
    weight,
    headline,
    sub,
    badges: Array.from(new Set(badges)).slice(0, 4),
    trust_points: Array.from(new Set(trust.map(t => t.label))).slice(0, 4)
      .map(label => ({ icon: 'info', label })),
    storage,
    uses: uses.slice(0, 5),
    highlights: Array.from(new Set(highlights)).slice(0, 5),
  };
}

// JSON 스펙(섹션형) 생성
function buildLayoutSpec(product, heroAbs) {
  const p = preprocessProduct(product);

  return {
    page_title: `${p.title} 상세페이지`,
    canvas: { width: 660, padding: 16, bg: "#FFFFFF" },
    design_tokens: {
      fonts: { headline: "Inter Bold", subtitle: "Inter Regular", body: "Inter Regular" },
      colors: { primary: "#2E7D32", muted: "#757575", accent: "#FF8A65", chipBg: "#FFF3E0" },
      radii: { lg: 12, md: 8, sm: 4 },
      spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 }
    },
    sections: [
      { type: "hero", title: p.headline || p.title, subtitle: p.sub, image: heroAbs, badges: p.badges },
      p.highlights.length ? { type: "chips", items: p.highlights } : null,
      p.trust_points.length ? { type: "trust", items: p.trust_points } : null,
      { type: "text", body: p.body },
      (p.storage || (p.uses && p.uses.length)) ? {
        type: "tri-cards",
        items: [
          p.storage ? { title: "보관", body: p.storage } : null,
          (p.weight || product.price) ? { title: "기본정보", body: [p.weight, product.price ? `가격: ₩${Number(product.price).toLocaleString()}` : ''].filter(Boolean).join('\n') } : null,
          (p.uses && p.uses.length) ? { title: "활용", body: p.uses.join(', ') } : null,
        ].filter(Boolean)
      } : null
    ].filter(Boolean)
  };
}

// GPT로 Figma 스펙 생성(현재는 규칙기반 스펙 + HTML/PNG 렌더)
exports.getFigmaSpec = async (req, res) => {
  try {
    const isPNG  = (req.query.format || '').toLowerCase() === 'png';
    const isHTML = (req.query.format || '').toLowerCase() === 'html';
    const isSeller = !!(req.user && req.user.user_type === 'seller');
    const sellerId = req.user?.seller_id;

    const id = Number(req.params.productId);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ status: 'error', message: '유효한 product id가 필요합니다.' });
    }

    // HTML/PNG는 공개, JSON만 셀러 제한
    const allowPublic = isPNG || isHTML;

    const product = await Product.findOne({
      where: allowPublic ? { product_id: id } : { product_id: id, seller_id: sellerId },
      include: [{ model: ProductImg, as: 'images', attributes: ['img_url','img_order','img_id','created_at'] }],
      order: [[{ model: ProductImg, as: 'images' }, 'img_order', 'ASC'], [{ model: ProductImg, as: 'images' }, 'img_id', 'ASC']],
    });
    if (!product) {
      return res.status(404).json({ status: 'error', message: '상품 없음 또는 권한이 없습니다.' });
    }

    // 이미지/텍스트 준비
    const images = (product.images || []).map(i => i.img_url).filter(Boolean);
    const heroRaw = images[0] || 'https://picsum.photos/1080/720';
    const hero = toCdn(heroRaw, { w: 1080, h: 720, fill: true });
    const heroAbs = toAbs(req, hero);

    // 규칙기반 스펙(JSON)
    const spec = buildLayoutSpec(product, heroAbs);

    // ── HTML 렌더(공개)
    if (isHTML) {
      const width = spec.canvas.width;
      const chips = (spec.sections.find(s => s.type === 'chips')?.items || [])
        .map(x => `<span class="chip">${x}</span>`).join('');
      const badges = (spec.sections.find(s => s.type === 'hero')?.badges || [])
        .map(x => `<span class="badge">${x}</span>`).join('');
      const trust  = (spec.sections.find(s => s.type === 'trust')?.items || [])
        .map(t => `<div class="trust-item"><div class="trust-icon"></div><div class="trust-label">${t.label}</div></div>`).join('');
      const tri    = (spec.sections.find(s => s.type === 'tri-cards')?.items || [])
        .map(it => `<div class="card"><div class="card-title">${it.title}</div><div class="card-body">${it.body.replace(/\n/g,'<br/>')}</div></div>`).join('');

      const heroSec = spec.sections.find(s => s.type === 'hero') || {};
      const bodySec = spec.sections.find(s => s.type === 'text') || { body: '' };

      const html = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    html, body { margin:0; padding:0; background:#fff; }
    .root { width:${width}px; padding:16px; font-family: system-ui, -apple-system, Roboto, "Noto Sans KR", sans-serif; box-sizing:border-box; }
    .hero-img { width:100%; border-radius:12px; box-shadow:0 4px 8px rgba(0,0,0,.08); display:block; }
    .name { margin:12px 0 6px; font-size:28px; font-weight:800; color:#2E7D32; text-align:center; }
    .sub { margin:0 0 8px; font-size:14px; color:#555; text-align:center; }
    .badges { display:flex; gap:8px; flex-wrap:wrap; justify-content:center; margin:6px 0 10px; }
    .badge { font-size:12px; background:#E8F5E9; color:#2E7D32; padding:6px 10px; border-radius:999px; }
    .chips { display:flex; gap:8px; flex-wrap:wrap; margin:8px 0 12px; }
    .chip { font-size:12px; background:#FFF3E0; color:#9C6B00; padding:6px 10px; border-radius:999px; }
    .divider { height:1px; background:#e5e5e5; margin:12px 0; }
    .trust { display:grid; grid-template-columns: repeat(2, 1fr); gap:12px; margin:8px 0 12px; }
    .trust-item { display:flex; gap:8px; align-items:center; }
    .trust-icon { width:20px; height:20px; border-radius:4px; background:#E8F5E9; }
    .trust-label { font-size:13px; color:#333; }
    .body { font-size:14px; line-height:1.6; color:#333; white-space:pre-wrap; margin:0; }
    .tri { display:grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap:12px; margin:12px 0 0; }
    .card { border:1px solid #eee; border-radius:12px; padding:12px; }
    .card-title { font-weight:700; margin-bottom:6px; font-size:14px; color:#2E7D32; }
    .card-body { font-size:13px; color:#333; line-height:1.5; }
  </style>
</head>
<body>
  <div class="root" id="root">
    <img class="hero-img" src="${heroAbs}" alt="" />
    <h1 class="name">${heroSec.title || ''}</h1>
    ${(heroSec.subtitle && !(heroSec.badges||[]).includes(heroSec.subtitle))
      ? `<p class="sub">${heroSec.subtitle}</p>` 
      : ''}
    <div class="badges">${badges}</div>
    ${chips ? `<div class="chips">${chips}</div>` : ''}
    <div class="divider"></div>
    ${trust ? `<div class="trust">${trust}</div>` : ''}
    <p class="body">${(spec.sections.find(s => s.type === 'text')?.body || '').replace(/</g,'&lt;')}</p>
    ${tri ? `<div class="tri">${tri}</div>` : ''}
  </div>
</body>
</html>`.trim();

      res.set('Cache-Control', 'public, max-age=60');
      return res.type('html').send(html);
    }

    // ── PNG 렌더(공개)
    if (isPNG) {
      const width = spec.canvas.width;
      let browser;
      try {
        browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
        const page = await browser.newPage();

        // HTML은 위 분기와 동일하게 다시 만들기(중복 줄이려면 함수화 가능)
        const htmlRes = await (async () => {
          const reqClone = { ...req, query: { ...req.query, format: 'html' } };
          // 간단하게 여기서 바로 문자열 생성 재사용
          const srv = `${req.protocol}://${req.get('host')}`;
          // 재생성을 피하려면 위 HTML 생성 코드를 함수로 빼세요.
          return `
            <html><meta charset="utf-8"/><body>렌더 준비 중</body></html>
          `;
        })();

        // 간단히: 위의 HTML 생성 블록을 함수로 추출해 재사용하세요.
        // 여기서는 동일 로직을 복붙하는 대신, 다시 생성:
        const heroSec = spec.sections.find(s => s.type === 'hero') || {};
        const chips = (spec.sections.find(s => s.type === 'chips')?.items || [])
          .map(x => `<span class="chip">${x}</span>`).join('');
        const badges = (heroSec.badges || [])
          .map(x => `<span class="badge">${x}</span>`).join('');
        const trust  = (spec.sections.find(s => s.type === 'trust')?.items || [])
          .map(t => `<div class="trust-item"><div class="trust-icon"></div><div class="trust-label">${t.label}</div></div>`).join('');
        const tri    = (spec.sections.find(s => s.type === 'tri-cards')?.items || [])
          .map(it => `<div class="card"><div class="card-title">${it.title}</div><div class="card-body">${it.body.replace(/\n/g,'<br/>')}</div></div>`).join('');

        const html = `
<!doctype html>
<html>
<head><meta charset="utf-8" />
<style>
  html, body { margin:0; padding:0; background:#fff; }
  .root { width:${width}px; padding:16px; font-family: system-ui, -apple-system, Roboto, "Noto Sans KR", sans-serif; box-sizing:border-box; }
  .hero-img { width:100%; border-radius:12px; box-shadow:0 4px 8px rgba(0,0,0,.08); display:block; }
  .name { margin:12px 0 6px; font-size:28px; font-weight:800; color:#2E7D32; text-align:center; }
  .sub { margin:0 0 8px; font-size:14px; color:#555; text-align:center; }
  .badges { display:flex; gap:8px; flex-wrap:wrap; justify-content:center; margin:6px 0 10px; }
  .badge { font-size:12px; background:#E8F5E9; color:#2E7D32; padding:6px 10px; border-radius:999px; }
  .chips { display:flex; gap:8px; flex-wrap:wrap; margin:8px 0 12px; }
  .chip { font-size:12px; background:#FFF3E0; color:#9C6B00; padding:6px 10px; border-radius:999px; }
  .divider { height:1px; background:#e5e5e5; margin:12px 0; }
  .trust { display:grid; grid-template-columns: repeat(2, 1fr); gap:12px; margin:8px 0 12px; }
  .trust-item { display:flex; gap:8px; align-items:center; }
  .trust-icon { width:20px; height:20px; border-radius:4px; background:#E8F5E9; }
  .trust-label { font-size:13px; color:#333; }
  .body { font-size:14px; line-height:1.6; color:#333; white-space:pre-wrap; margin:0; }
  .tri { display:grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap:12px; margin:12px 0 0; }
  .card { border:1px solid #eee; border-radius:12px; padding:12px; }
  .card-title { font-weight:700; margin-bottom:6px; font-size:14px; color:#2E7D32; }
  .card-body { font-size:13px; color:#333; line-height:1.5; }
</style>
</head>
<body>
  <div class="root" id="root">
    <img class="hero-img" src="${heroAbs}" alt="" />
    <h1 class="name">${heroSec.title || ''}</h1>
    ${heroSec.subtitle ? `<p class="sub">${heroSec.subtitle}</p>` : ''}
    <div class="badges">${badges}</div>
    ${chips ? `<div class="chips">${chips}</div>` : ''}
    <div class="divider"></div>
    ${trust ? `<div class="trust">${trust}</div>` : ''}
    <p class="body">${(spec.sections.find(s => s.type === 'text')?.body || '').replace(/</g,'&lt;')}</p>
    ${tri ? `<div class="tri">${tri}</div>` : ''}
  </div>
</body>
</html>`.trim();

        await page.setViewport({ width, height: 900 });
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const clip = await page.$eval('#root', el => {
          const r = el.getBoundingClientRect();
          return { x: Math.floor(r.x), y: Math.floor(r.y), width: Math.ceil(r.width), height: Math.ceil(r.height) };
        });
        const png = await page.screenshot({ type: 'png', clip });
        res.set('Cache-Control', 'public, max-age=300');
        return res.type('png').send(png);
      } finally {
        // Note: 브라우저 close 누락 방지
        // eslint-disable-next-line no-unsafe-finally
        if (browser) await browser.close();
      }
    }

    // ── JSON 스펙(셀러 전용)
    if (!isSeller) {
      return res.status(403).json({ error: "판매자만 스펙(JSON)을 조회할 수 있습니다." });
    }
    return res.json(spec);

  } catch (e) {
    console.error(e);
    return res.status(500).json({ status: 'error', message: 'preview 생성 실패', error: String(e) });
  }
};

// 플러그인에서 보낸 PNG를 Cloudinary에 저장하고, product.figma_export_url 업데이트
exports.saveFigmaExport = async (req, res) => {
  try {
    if (!req.user || req.user.user_type !== "seller") {
      return res.status(403).json({ error: "판매자만 상품을 등록할 수 있습니다." });
    }
    const sellerId = req.user.seller_id;

    const id = Number(req.params.productId);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ status: 'error', message: '유효한 product id가 필요합니다.' });
    }
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: '파일 없음' });
    }

    const secureUrl = req.file.path;     // Cloudinary 최종 URL
    const publicId  = req.file.filename;

    const [affected] = await Product.update(
      { figma_export_url: secureUrl },
      { where: { product_id: id, seller_id: sellerId } }
    );
    if (affected === 0) {
      return res.status(404).json({ status: 'error', message: '상품 없음 또는 권한이 없습니다.' });
    }

    return res.json({ status: 'success', data: { product_id: id, figma_export_url: secureUrl, public_id: publicId } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ status: 'error', message: 'figma export 저장 실패', error: String(e) });
  }
};