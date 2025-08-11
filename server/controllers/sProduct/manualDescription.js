const path = require("path");
const { Product } = require("../../models");

exports.saveManualDescription = async (req, res) => {
    const { productId } = req.params;
    const { description } = req.body;
  
    if (!req.user || req.user.user_type !== 'seller') {
      return res.status(403).json({ message: '판매자만 접근할 수 있습니다.' });
    }
  
    if (!description) {
      return res.status(400).json({ message: '설명이 비어 있습니다.' });
    }
  
    try {
      const [updated] = await Product.update(
        { description },
        { where: { product_id: productId } }
      );
  
      if (updated === 0) {
        return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
      }
  
      res.status(200).json({ message: '설명이 성공적으로 저장되었습니다.' });
    } catch (err) {
      console.error('설명 저장 실패:', err);
      res.status(500).json({ message: '설명 저장 중 오류 발생', error: err.message });
    }
  };