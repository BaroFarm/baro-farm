const path = require("path");
const { Product } = require("../../models");
const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// AI 상세 설명 요약
exports.getSummaryDescription = async (req, res) => {
    const productId = req.params.productId;
    const sellerId = req.user?.seller_id;
  
    try {
      const product = await Product.findOne({
        where: {
          product_id: productId,
          seller_id: sellerId,
        },
      });
  
      if (!product || !product.description) {
        return res.status(404).json({ message: "상품 설명이 없습니다." });
      }
  
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "상품 설명을 고객이 이해하기 쉽도록 1~2줄로 요약해줘.",
          },
          {
            role: "user",
            content: product.description,
          },
        ],
      });
  
      const summary = completion.choices[0].message.content.trim();
      res.status(200).json({ summary });
    } catch (err) {
      console.error("요약 오류:", err);
      res.status(500).json({ message: "요약 실패", error: err.message });
    }
  };
  
  // AI 상세 설명 저장
  exports.saveSummaryToIntro = async (req, res) => {
    const productId = req.params.productId;
    const sellerId = req.user?.seller_id;
    const { summary } = req.body;
  
    if (!summary) {
      return res.status(400).json({ message: "요약 내용이 없습니다." });
    }
  
    try {
      const product = await Product.findOne({
        where: {
          product_id: productId,
          seller_id: sellerId,
        },
      });
  
      if (!product) {
        return res.status(404).json({ message: "상품을 찾을 수 없습니다." });
      }
  
      await Product.update(
        { intro: summary },
        { where: { product_id: productId } }
      );
  
      res.status(200).json({ message: "intro에 저장 완료" });
    } catch (err) {
      console.error("요약 저장 오류:", err);
      res.status(500).json({ message: "요약 저장 실패", error: err.message });
    }
  };