const path = require("path");
const { Product } = require("../../models");

exports.getProductVideo = async (req, res) => {
    const productId = req.params.productId;
    const sellerId = req.user?.seller_id;
  
    if (!sellerId) {
      return res.status(403).json({ message: "판매자만 접근 가능합니다." });
    }
  
    try {
      const product = await Product.findOne({
        where: {
          product_id: productId,
          seller_id: sellerId, // 🔐 본인의 상품인지 확인
        },
        attributes: ['product_id', 'video_url'],
      });
  
      if (!product || !product.video_url) {
        return res.status(404).json({ message: "영상이 존재하지 않습니다." });
      }
  
      res.status(200).json({
        status: "success",
        data: {
          product_id: product.product_id,
          video_url: product.video_url,
        },
      });
    } catch (err) {
      console.error("영상 조회 오류:", err);
      res.status(500).json({ message: "영상 조회 실패", error: err.message });

    console.log("요청된 productId:", req.params.product_id);
    }
  };