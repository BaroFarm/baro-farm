// controllers/cartController.js
const { sequelize, Cart, CartItem, Product } = require('../models');
const ALLOWED_TYPES = ['pickup', 'smart']; 

exports.addToCart = async (req, res) => {
    const product_id = Number(req.body.product_id);
    const quantity   = Number(req.body.quantity);
    const delivery_type = String(req.body.delivery_type || '').toLowerCase();

    const user = req.user;
    if (!user) {
        return res.status(401).json({ status: 'error', code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' });
    }
    if (user.user_type !== 'buyer') {
        return res.status(403).json({ status: 'error', code: 'FORBIDDEN', message: '구매자만 사용할 수 있는 기능입니다.' });
    }
    const customer_id = user.customer_id;
    
    // 기본 검증
    if (!product_id || !quantity || !delivery_type) {
        return res.status(400).json({
        status: 'error', code: 'INVALID_REQUEST',
        message: "필수 필드(product_id, quantity, delivery_type)가 누락되었습니다."
        });
    }
    if (!Number.isInteger(product_id) || product_id < 1) {
        return res.status(400).json({
        status: 'error', code: 'INVALID_REQUEST',
        message: "'product_id'는 1 이상의 정수여야 합니다."
        });
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
        status: 'error', code: 'INVALID_REQUEST',
        message: "'quantity'는 1 이상의 정수여야 합니다."
        });
    }
    if (!ALLOWED_TYPES.includes(delivery_type)) {
        return res.status(400).json({
        status: 'error', code: 'INVALID_REQUEST',
        message: "'delivery_type'은 'pickup' 또는 'smart' 중 하나여야 합니다."
        });
    }

    try {
        // 상품 존재 확인
        const product = await Product.findByPk(product_id);
        if (!product) {
            return res.status(404).json({
                status: 'error', code: 'PRODUCT_NOT_FOUND', message: '해당 상품을 찾을 수 없습니다.'
            });
        }

        // 트랜잭션: cart get-or-create → 같은 라인 병합 또는 생성
    const item = await sequelize.transaction(async (t) => {
        let cart = await Cart.findOne({ where: { customer_id }, transaction: t });
        if (!cart) cart = await Cart.create({ customer_id }, { transaction: t });

        const existing = await CartItem.findOne({
            where: { cart_id: cart.cart_id, product_id, delivery_type },
            transaction: t
        });

        if (existing) {
            existing.quantity = Number(existing.quantity) + quantity;
            await existing.save({ transaction: t });
            return existing;
        }

        return await CartItem.create({
            cart_id: cart.cart_id,
            product_id,
            quantity,
            delivery_type
        }, { transaction: t });
        });

        return res.status(200).json({
        status: 'success',
        message: '상품이 장바구니에 추가되었습니다.',
        data: {
            cart_item_id: item.cart_item_id,
            product_id,
            quantity: item.quantity,
            delivery_type
        }
        });
    } catch (err) {
        console.error('장바구니 추가 오류:', err);
        return res.status(500).json({
        status: 'error',
        code: 'SERVER_ERROR',
        message: '서버 내부 오류가 발생했습니다.'
        });
    }
};

// 장바구니 조회
exports.getCart = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                status: 'error',
                code: 'UNAUTHORIZED',
                message: '로그인이 필요합니다.'
            });
        }
        if (user.user_type !== 'buyer') {
            return res.status(403).json({
                status: 'error',
                code: 'FORBIDDEN',
                message: '구매자만 사용할 수 있는 기능입니다.'
            });
        }
        const customer_id = req.user.customer_id;

        const cart = await Cart.findOne({
            where: { customer_id },
            include: [
                {
                    model: CartItem,
                    as: 'items',
                    include: [
                        {
                            model: Product,
                            as: 'product',
                            attributes: ['product_id', 'title', 'price']
                        }
                    ]
                }
            ]
        });

        if (!cart) {
            return res.status(404).json({
                status: 'error',
                code: 'CART_NOT_FOUND',
                message: '장바구니를 찾을 수 없습니다.'
            });
        }

        if (cart.items.length === 0) {
            return res.status(200).json({
                status: 'success',
                message: '장바구니가 비어 있습니다.',
                data: []
            });
        }

        return res.status(200).json({
            status: 'success',
            data: cart.items
        });

    } catch (err) {
        console.error('장바구니 조회 오류:', err);
        return res.status(500).json({
            status: 'error',
            code: 'SERVER_ERROR',
            message: '서버 내부 오류가 발생했습니다.'
        });
    }
};

// 장바구니 항목 삭제
exports.removeFromCart = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                status: 'error',
                code: 'UNAUTHORIZED',
                message: '로그인이 필요합니다.'
            });
        }
        if (user.user_type !== 'buyer') {
            return res.status(403).json({
                status: 'error',
                code: 'FORBIDDEN',
                message: '구매자만 사용할 수 있는 기능입니다.'
            });
        }

        const customer_id = req.user.customer_id;
        const { cart_item_id } = req.params;

        const cart = await Cart.findOne({ where: { customer_id } });
        if (!cart) {
            return res.status(404).json({
                status: 'error',
                code: 'CART_NOT_FOUND',
                message: '장바구니를 찾을 수 없습니다.'
            });
        }

        const deleted = await CartItem.destroy({
            where: {
                cart_id: cart.cart_id,
                cart_item_id
            }
        });

        if (!deleted) {
            return res.status(404).json({
                status: 'error',
                code: 'ITEM_NOT_FOUND',
                message: '장바구니에서 해당 상품을 찾을 수 없습니다.'
            });
        }

        return res.status(200).json({
            status: 'success',
            message: '장바구니에서 해당 상품이 삭제되었습니다.'
        });

    } catch (err) {
        console.error('장바구니 삭제 오류:', err);
        return res.status(500).json({
            status: 'error',
            code: 'SERVER_ERROR',
            message: '서버 내부 오류가 발생했습니다.'
        });
    }
};
