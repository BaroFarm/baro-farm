const path = require("path");
const { Product, ProductImg } = require("../../models");

// 상품 이미지 업로드
exports.uploadImages = async (req, res) => {
    if (!req.user || req.user.user_type !== "seller") {
      return res.status(403).json({ message: "판매자만 이미지 업로드가 가능합니다." });
    }
  
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