const path = require("path");
const { Product } = require("../../models");

// 상품 기본 정보 등록
exports.postBasicInfo = async (req, res) => {
    try {
      // 판매자인지 확인
      if (!req.user || req.user.user_type !== "seller") {
        return res.status(403).json({ error: "판매자만 상품을 등록할 수 있습니다." });
      }
  
      const {
        title,
        category_id,
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
        seller_id: req.user.seller_id, // req.user에서 추출
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