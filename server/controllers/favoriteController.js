// server/controllers/store_wishlist.controller.js
const { StoreWishlist, Store } = require('../models');

exports.addToStoreWishlist = async (req, res) => {
    try {
        const customerId = req.user.customer_id;
        const { store_id } = req.body;

        // 필수 파라미터 검증
        if (!store_id) {
            return res.status(400).json({
                status: "error",
                code: 400,
                message: "'store_id' 값은 필수입니다."
            });
        }

        // 매장 존재 여부 확인
        const store = await Store.findByPk(store_id);
        if (!store) {
            return res.status(404).json({
                status: "error",
                code: 404,
                message: `매장 ID ${store_id}를 찾을 수 없습니다.`
            });
        }

        // 이미 찜한 매장인지 확인
        const exists = await StoreWishlist.findOne({
            where: { store_id, customer_id: customerId }
        });
        if (exists) {
            return res.status(409).json({
                status: "error",
                code: 409,
                message: "이미 찜 목록에 추가된 매장입니다."
            });
        }

        // 찜 목록에 추가
        await StoreWishlist.create({
            store_id,
            customer_id: customerId,
            created_at: new Date()
        });

        return res.status(201).json({
            status: "success",
            message: "매장을 찜 목록에 추가했습니다."
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            status: "error",
            code: 500,
            message: "서버 내부 오류가 발생했습니다."
        });
    }
};