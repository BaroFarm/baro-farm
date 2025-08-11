const { Customer, Product, Category, Order, ProductWishlist, StoreWishlist } = require('../models');
const { getPopularProducts, getContentBasedRecommendedProducts } = require('./recommendLogic');

const recommendProducts = async (req, res) => {
    try {
        console.log('req.user:', req.user);
        const customer = req.user;
        const limit = 20; // 추천 상품 개수
        let products;

        if (!customer) { // 비로그인: 전체 인기 상품 추천
            products = await getPopularProducts(limit);
        } else {
            const customerId = req.user.customer_id;
            products = await getContentBasedRecommendedProducts(customerId, limit);
        }

        const result = products.map(product => ({
            id: String(product.product_id), 
            title: product.title,
            price: product.price,
            image_url: product.ProductImgs && product.ProductImgs.length > 0
            ? product.ProductImgs[0].img_url: null,
        }));

        res.json({
            status: 'success',
            data: result,
        });

    } catch (err) {
    console.error(err);
    res.status(500).json({
        status: 'error',
        code: 'SERVER_ERROR',
        message: '서버 내부 오류가 발생했습니다.'
    });
    }
};

module.exports = { recommendProducts };