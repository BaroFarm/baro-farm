// server/controllers/wishlist.controller.js
const { ProductWishlist, Product } = require('../models');

exports.addToWishlist = async (req, res) => {
    try {
        const customerId = req.user.customer_id; 
        const { product_id } = req.body;

        // 필수 파라미터 검증
        if (!product_id) {
            return res.status(400).json({
                error: { code: 400, message: "'product_id' 값은 필수입니다." }
            });
        }

        // 상품 존재 여부 확인
        const product = await Product.findByPk(product_id);
        if (!product) {
            return res.status(404).json({
                error: { code: 404, message: `상품 ID ${product_id}를 찾을 수 없습니다.` }
            });
        }

        // 이미 찜한 상품인지 확인
        const exists = await ProductWishlist.findOne({
            where: { product_id, customer_id: customerId }
        });
        if (exists) {
            return res.status(409).json({
                error: { code: 409, message: "이미 찜 목록에 추가된 상품입니다." }
            });
        }

        // 찜 목록에 추가
        await ProductWishlist.create({
            product_id,
            customer_id: customerId,
            created_at: new Date()
        });

        return res.status(201).json({
            status: "success",
            message: "상품을 찜 목록에 추가했습니다."
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: { code: 500, message: "서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요." }
        });
    }
};
