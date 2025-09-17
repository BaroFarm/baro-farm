const { Seller, Store, Product } = require('../models');

//응답에 상품 포함하기 위해 추가하였습니다. - 프론트
exports.getStore = async (req, res) => {
  try {
    const sellerId = req.user.seller_id;
    const seller = await Seller.findByPk(sellerId);

    if (!seller) {
      return res.status(401).json({ status: 'error', message: '로그인이 필요합니다.', code: 401 });
    }

    const store = await Store.findByPk(seller.store_id, {
      attributes: ['name', 'zip_code', 'street', 'detail']
    });

    const products = await Product.findAll({
      where: { seller_id: sellerId },
      attributes: ['product_id', 'title', 'weight', 'intro', 'price']
    });

    return res.status(200).json({
      status: 'success',
      data: {
        ...store.get(),
        products  // ✅ 상품 포함해서 내려줌
      }
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ status: 'error', message: '서버 내부 오류', code: 500 });
  }
};

// 상품 목록 조회
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

// 상품 삭제

exports.deleteProduct = async (req, res) => {
  try {
    const sellerId = req.user.seller_id;
    const productId = req.params.product_id;

    const product = await Product.findOne({ where: { product_id: productId } });

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: '해당 상품을 찾을 수 없습니다.',
        code: 404
      });
    }

    if (product.seller_id !== sellerId) {
      return res.status(403).json({
        status: 'error',
        message: '해당 상품을 삭제할 권한이 없습니다.',
        code: 403
      });
    }

    await product.destroy();

    return res.status(200).json({
      status: 'success',
      message: '상품이 삭제되었습니다.',
      data: {
        product_id: product.product_id
      }
    });

  } catch (error) {
    console.error('상품 삭제 오류:', error);
    return res.status(500).json({
      status: 'error',
      message: '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      code: 500
    });
  }
};

// 상품 정보 조회
exports.getProductDetail = async (req, res) => {
    try {
      const sellerId = req.user.seller_id;
      const productId = req.params.product_id;
  
      const product = await Product.findOne({
        where: { product_id: productId, seller_id: sellerId }
      });
  
      if (!product) {
        return res.status(404).json({
          status: 'error',
          message: '해당 상품을 찾을 수 없습니다.',
          code: 404
        });
      }
  
      return res.status(200).json({
        status: 'success',
        data: product
      });
  
    } catch (error) {
      console.error('상품 조회 오류:', error);
      return res.status(500).json({
        status: 'error',
        message: '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        code: 500
      });
    }
  };

// 상품 정보 수정
exports.updateProduct = async (req, res) => {
    try {
      const sellerId = req.user.seller_id;
      const productId = req.params.product_id;
  
      const product = await Product.findOne({
        where: { product_id: productId, seller_id: sellerId }
      });
  
      if (!product) {
        return res.status(404).json({
          status: 'error',
          message: '해당 상품을 찾을 수 없습니다.',
          code: 404
        });
      }
  
      await product.update(req.body);
  
      return res.status(200).json({
        status: 'success',
        message: '상품 정보가 수정되었습니다.',
        data: {
          product_id: product.product_id
        }
      });
  
    } catch (error) {
      console.error('상품 수정 오류:', error);
      return res.status(500).json({
        status: 'error',
        message: '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        code: 500
      });
    }
  };