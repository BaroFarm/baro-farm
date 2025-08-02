const { Seller, Product } = require('../models');

exports.getProductList = async (req, res) => {
  try {
    const sellerId = req.user.seller_id;

    const seller = await Seller.findByPk(sellerId);
    if (!seller) {
      return res.status(401).json({
        status: 'error',
        message: '로그인이 필요합니다.',
        code: 401
      });
    }

    const products = await Product.findAll({
      where: { seller_id: sellerId },
      attributes: ['product_id', 'title', 'weight', 'intro', 'price']
    });

    if (!products || products.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '상품을 찾을 수 없습니다.',
        code: 404
      });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        name: seller.store_name,
        products
      }
    });

  } catch (error) {
    console.error('상품 목록 조회 실패:', error);
    return res.status(500).json({
      status: 'error',
      message: '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      code: 500
    });
  }
};