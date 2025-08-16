const { Product, ProductImg } = require('../../models');
const cloudinary = require('cloudinary').v2;
const puppeteer = require('puppeteer');

// GPT로 Figma 스펙 생성

exports.getFigmaSpec = async (req, res) => {
    try {
      // 인증/권한
      // if (!req.user || req.user.user_type !== "seller") {
      //   return res.status(403).json({ error: "판매자만 상품을 등록할 수 있습니다." });
      // }
      // const sellerId = req.user.seller_id;
       // PNG는 공개 허용(고객 상세화면용). JSON(spec)은 셀러만.
        const isPNG = (req.query.format || '').toLowerCase() === 'png';
        const isHTML  = (req.query.format || '').toLowerCase() === 'html';
        const isSeller = !!(req.user && req.user.user_type === 'seller');
        const sellerId = req.user?.seller_id;
  
        const id = Number(req.params.productId);
        if (!Number.isInteger(id) || id <= 0) {
          return res.status(400).json({ status: 'error', message: '유효한 product id가 필요합니다.' });
        }
  
      // 상품 + 이미지
        const product = await Product.findOne({
      //   where: { product_id: id, seller_id: sellerId },
      //   include: [{ model: ProductImg, as: 'ProductImgs', order: [['img_order', 'ASC']] }],
      // });
      // PNG는 seller 제한 없이 product_id만, JSON은 seller 제한
      where: isPNG ? { product_id: id } : { product_id: id, seller_id: sellerId },
      include: [{ model: ProductImg, as: 'ProductImgs', attributes: ['img_url','img_order','img_id','created_at'] }],
     // include 내부 order 대신 최상위 order 로 보장
      order: [[{ model: ProductImg, as: 'ProductImgs' }, 'img_order', 'ASC'],
              [{ model: ProductImg, as: 'ProductImgs' }, 'img_id', 'ASC']],
      });
      if (!product) {
        return res.status(404).json({ status: 'error', message: '상품 없음 또는 권한이 없습니다.' });
      }
  
      const images = (product.ProductImgs || []).map(i => i.img_url).filter(Boolean);
      const hero = images[0] || 'https://picsum.photos/640/480';
      const title = product.title || '상품명 없음';
      const subtitle = product.intro || '';
      const body = product.description || '상품 설명이 없습니다.';
  
      // ✅ HTML도 PNG처럼 공개로 처리하고 싶으면 isPNG와 동일 분기로 둡니다.
      if (isHTML) {
        res.set('Cache-Control', 'public, max-age=60');
        res.type('html').send(html);
        return;
      }
      // png
      //if ((req.query.format || '').toLowerCase() === 'png') {
      // PNG 응답 (고객 화면에서 <img src>로 바로 사용)
      if (isPNG) {
        if (product.figma_export_url) {
          return res.redirect(302, product.figma_export_url);
        }
  
        // 즉석 렌더 (puppeteer)
        const width = 500;
        const html = `
        <!doctype html>
        <html>
        <head>
          <meta charset="utf-8" />
          <style>
            html, body { margin:0; padding:0; background:#fff; }
            .root {
              width:${width}px;
              padding:16px;
              font-family: system-ui, -apple-system, Roboto, "Noto Sans KR", sans-serif;
              box-sizing: border-box;
            }
            /* Hero 이미지: radius 12 + drop shadow */
            .hero-img {
              width:100%;
              border-radius:12px;
              box-shadow:0 4px 8px rgba(0,0,0,.1);
              display:block;
            }
            /* 제목(상품명): 중앙정렬, 굵게, 32px, 초록색 */
            .name {
              margin:10px 0 8px;
              font-size:32px;
              font-weight:800;
              color:#2E7D32;
              text-align:center;
            }
            /* 긴 가로선: 프레임 전체 폭, 연한 회색 */
            .divider {
              height:1px;
              background:#d2d2d2; /* figma line: r=0.82 근사 */
              margin:0 0 12px;
            }
            /* 본문: 14px / line-height 20px, 진한 회색, pre-wrap */
            .body {
              font-size:14px;
              line-height:20px;
              color:#333333;
              white-space:pre-wrap;
              margin:0;
            }
          </style>
        </head>
        <body>
          <div class="root" id="root">
            <img class="hero-img" src="${hero}" alt="" />
            <h1 class="name">${title}</h1>
            <div class="divider"></div>
            <div class="body">${body}</div>
          </div>
        </body>
        </html>`;
  
      //   const browser = await puppeteer.launch({
      //     args: ['--no-sandbox', '--disable-setuid-sandbox']
      //   });
      //   const page = await browser.newPage();
      //   await page.setViewport({ width, height: 900 });
      //   await page.setContent(html, { waitUntil: 'networkidle0' });
  
      //   const clip = await page.$eval('#root', el => {
      //     const r = el.getBoundingClientRect();
      //     return { x: Math.floor(r.x), y: Math.floor(r.y), width: Math.ceil(r.width), height: Math.ceil(r.height) };
      //   });
  
      //   const png = await page.screenshot({ type: 'png', clip });
      //   await browser.close();
  
      //   res.set('Content-Type', 'image/png');
      //   return res.send(png);
      // }
      let browser;
      try {
        browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.setViewport({ width, height: 900 });
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const clip = await page.$eval('#root', el => {
          const r = el.getBoundingClientRect();
          return { x: Math.floor(r.x), y: Math.floor(r.y), width: Math.ceil(r.width), height: Math.ceil(r.height) };
        });
        const png = await page.screenshot({ type: 'png', clip });
       // 캐시 헤더(선택)
        res.set('Cache-Control', 'public, max-age=300'); // 5분
        res.set('Content-Type', 'image/png');
        return res.send(png);
      } finally {
        if (browser) await browser.close();
      }
    }

   // JSON(spec)은 셀러만
    if (!isSeller) {
      return res.status(403).json({ error: "판매자만 스펙(JSON)을 조회할 수 있습니다." });
    }
  
      // JSON 응답 모드(기본)
      const spec = {
        page_title: `${title} 상세페이지`,
        canvas: { width: 500, padding: 16, bg: "#FFFFFF" },
        design_tokens: {
          fonts: { headline: "Inter Bold", subtitle: "Inter Regular", body: "Inter Regular" },
          colors: { primary: "#2E7D32", muted: "#757575", accent: "#FF8A65", chipBg: "#FFF3E0" },
          radii: { lg: 12, md: 8, sm: 4 },
          spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 }
        },
        sections: [
          { type: "hero", title, subtitle, image: hero },
          { type: "text", body }
        ]
      };
  
      return res.json(spec);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ status: 'error', message: 'preview 생성 실패', error: String(e) });
    }
  };

  // 플러그인에서 보낸 PNG를 Cloudinary에 저장하고, product.figma_export_url 업데이트
exports.saveFigmaExport = async (req, res) => {
    try {
      // 인증
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
  
      // DB 업데이트
      const [affected] = await Product.update(
        { figma_export_url: secureUrl },
        { where: { product_id: id, seller_id: sellerId } }
      );
      if (affected === 0) {
        return res.status(404).json({ status: 'error', message: '상품 없음 또는 권한이 없습니다.' });
      }
  
      return res.json({
        status: 'success',
        data: { product_id: id, figma_export_url: secureUrl, public_id: publicId }
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ status: 'error', message: 'figma export 저장 실패', error: String(e) });
    }
  };