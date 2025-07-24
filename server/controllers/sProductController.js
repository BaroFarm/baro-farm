// server/controllers/sProductController.js
const path = require("path");
const { Product, ProductImg } = require("../models");
const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 상품 기본 정보 등록
exports.getBasicPage = (req, res) => {
  res.sendFile(path.join(__dirname, "../views/basic.html"));
};

exports.postBasicInfo = async (req, res) => {
  try {
    const {
      title,
      category_id,
      seller_id,
      direct_store_id,
      status,
      weight,
      price,
      description,
      intro,
      is_video,
      video_url,
      created_at,
      returnable,
    } = req.body;

    const newProduct = await Product.create({
      title,
      category_id,
      seller_id,
      direct_store_id,
      status,
      weight,
      price,
      description,
      intro,
      is_video,
      video_url,
      created_at,
      updated_at: null,
      returnable,
    });

    res.status(201).json({ product: newProduct });
  } catch (err) {
    console.error("상품 등록 오류:", err);
    res.status(500).json({ error: "상품 등록 실패", details: err.message });
  }
};

// 상품 이미지 등록
exports.getImagesPage = (req, res) => {
  res.sendFile(path.join(__dirname, "../views/images.html"));
};

exports.uploadImages = async (req, res) => {
  const productId = req.params.productId;

  try {
    const imageUrls = req.files.map((file) => file.path);

    for (let i = 0; i < imageUrls.length; i++) {
      await ProductImg.create({
        product_id: productId,
        img_url: imageUrls[i],
        img_order: i + 1,
        created_at: new Date(),
      });
    }

    res.status(200).json({
      message: "이미지 업로드 및 저장 완료",
      urls: imageUrls,
    });
  } catch (err) {
    console.error("이미지 업로드 실패:", err);
    res.status(500).json({ message: "업로드 실패", error: err.message });
  }
};

// AI 상품 설명 생성
exports.getAIGenPage = (req, res) => {
  res.sendFile(path.join(__dirname, "../views/ai-gen.html"));
};

exports.generateAIDescription = async (req, res) => {
  const { keywords } = req.body;

  if (!keywords) {
    return res.status(400).json({ message: "키워드를 입력해주세요." });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `당신은 로컬푸드 전문 쇼핑몰의 마케팅 작가입니다. 
          농산물의 산지, 재배 환경, 품질, 영양소, 활용법, 보관법 등을 바탕으로 소비자의 신뢰를 얻을 수 있는 상품 소개글을 작성해야 합니다. 
          고객은 건강하고 안전한 먹거리를 찾고 있으며, 설명은 과장보다 정보 중심의 문체를 사용해야 합니다.`,
        },
        {
          role: "user",
          content: `다음 키워드를 활용해 로컬푸드 상품 설명글을 20줄 이상 작성해줘. 
      
          [키워드] ${keywords}
          
          설명에는 아래 내용을 반드시 포함해줘:
          - 작물의 산지의 환경적 특성
          - 재배 토양의 장점
          - 수확 후 처리 및 신선도 유지 방식
          - 영양 성분 및 건강 효능
          - 조리 활용 예시(ex. 생식, 조림, 주스 등)와 조리 방법
          - 보관 및 세척 방법
          - 왜 이 상품이 좋은 선택인지
          
          상품 상세페이지에 직접 사용할 수 있을 정도로 구체적이고 신뢰감 있게 써줘. 감성적인 문장은 포함해도 되지만 정보가 가장 중요해.`,
        },
      ],
    });

    const generatedDescription = completion.choices[0].message.content;
    res.json({ generatedDescription });
  } catch (err) {
    console.error("AI 설명 생성 오류:", err);
    res.status(500).json({ message: "AI 설명 생성 실패", error: err.message });
  }
};

// AI 상세 설명 저장
exports.saveAIDescription = async (req, res) => {
  const productId = req.params.productId;
  const { description } = req.body;

  if (!description) {
    return res.status(400).json({ message: "설명을 전달받지 못했습니다." });
  }

  try {
    const [updated] = await Product.update(
      { description },
      { where: { product_id: productId } }
    );

    if (updated === 0) {
      return res.status(404).json({ message: "상품을 찾을 수 없습니다." });
    }

    res.status(200).json({ message: "AI 설명이 저장되었습니다." });
  } catch (err) {
    console.error("AI 설명 저장 오류:", err);
    res.status(500).json({ message: "설명 저장 실패", error: err.message });
  }
};

// AI 상세 설명 요약
exports.getSummaryPage = (req, res) => {
  res.sendFile(path.join(__dirname, "../views/summary.html"));
};
