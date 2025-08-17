const { Product, Seller, Category, DirectStore } = require('../../models');
const { Op } = require('sequelize');

exports.getProducts = async (req, res) => {
    try {
        // 쿼리 파라미터 추출 
        const { category, sort = 'latest', page = 1, limit = 20, regular_delivery } = req.query;
        
        // 정렬 방식 유효성 검사 
        const validSorts = ['latest', 'popular', 'price_asc', 'price_desc'];
        if (!validSorts.includes(sort)) {
            return res.status(400).json({
                error: {
                code: 400,
                message: "'sort' 값이 유효하지 않습니다. [latest, popular, price_asc, price_desc] 중 하나여야 합니다."
                }
            });
        }
        
        // regular_delivery 유효성 검사 
        if (regular_delivery !== undefined && !['true','false','1','0'].includes(String(regular_delivery))) {
        return res.status(400).json({
            status: 'error',
            code: 'INVALID_REGULAR_DELIVERY',
            message: "regular_delivery 값은 true 또는 false 여야 합니다."
        });
        }

        // 정렬 조건 정의 
        const order = {
            latest: [['created_at', 'DESC']],
            popular: [['price', 'DESC']],   // 향후 판매량을 기준으로 대체 
            price_asc: [['price', 'ASC']],
            price_desc: [['price', 'DESC']]
        }[sort];

        // 카테고리 필터링 조건 
        const where = {};
        if (category) {
            where['$category.category_name$'] = { [Op.like]: `%${category}%` };
        }
        if (regular_delivery !== undefined) {
            const bool = (regular_delivery === 'true' || regular_delivery === '1');
            where.regular_delivery = bool;
            where.status = '판매중';     // 정기배송 노출은 판매중만 
        }

        // 페이지네이션 계산 
        const pageNum  = Math.max(parseInt(page, 10) || 1, 1);
        const perPage  = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
        const offset = (page - 1) * limit;

        // 상품 조회 쿼리 실행 
        const { count, rows } = await Product.findAndCountAll({
            where,
            order,
            include: [{ model: Category, as: 'category', attributes: ['category_name'] }],
            offset,
            limit: perPage,
            attributes: ['product_id', ['title','name'], 'price', 'created_at', 'regular_delivery']
        });

        if (rows.length === 0) {
            return res.status(404).json({
                status: 'error',
                code: 'NOT_FOUND',
                message: '상품을 찾을 수 없습니다.'
            });
        }

        const totalPages = Math.ceil(count / perPage);

        return res.status(200).json({
            status: 'success',
            pagination: {
                current_page: pageNum,
                total_pages: totalPages,
                total_products: count
            },
            products: rows.map(p => ({
                product_id: p.product_id,
                name: p.name,
                price: p.price,
                category: p.category?.category_name || null,
                image_url: `https://cdn.baro.com/images/product/${p.product_id}.jpg`,
                is_local: true,
                is_subscription_available: !!p.regular_delivery,
                average_rating: 4.7 
            }))
        });

    } catch (error) {
            console.error('상품 목록 조회 오류:', error);
            return res.status(500).json({
                status: 'error',
                code: 'SERVER_ERROR',
                message: '서버 내부 오류가 발생하였습니다.'
        });
    }
};

exports.getProductDetail = async (req, res) => {
    const productId = parseInt(req.params.product_id, 10);

    if (isNaN(productId) || productId <= 0) {
        return res.status(400).json({
        status: 'error',
        code: 'INVALID_ID',
        message: '유효하지 않은 상품 ID입니다. 숫자 형식이어야 합니다.'
        });
    }

    try {
        const product = await Product.findOne({
        where: { product_id: productId },
        include: [
            {
                model: Category,
                as: 'category',
                attributes: ['category_id', 'category_name']
            },
            {
                model: Seller,
                as: 'seller',
                attributes: ['seller_id', 'name', 'contact']
            },
            {
                model: DirectStore,
                as: 'direct_store',
                attributes: ['direct_store_id', 'name']
            }
        ]
    });

    if (!product) {
        return res.status(404).json({
            status: 'error',
            code: 'NOT_FOUND',
            message: '해당 상품을 찾을 수 없습니다.'
        });
    }

    res.status(200).json({
        status: 'success',
        data: {
            id: product.product_id,
            title: product.title,
            price: product.price,
            weight: product.weight,
            status: product.status,
            description: product.description,
            image_url: `https://cdn.baro.com/images/product/${product.product_id}.jpg`,
            is_returnable: product.returnable,
            is_subscription: !!product.regular_delivery,
            is_video: product.is_video,
            video_url: product.video_url,
            created_at: product.created_at,
            updated_at: product.updated_at,
                category: product.category
            ? { id: product.category.category_id, name: product.category.category_name }
            : null,
            seller: product.seller
            ? { id: product.seller.seller_id, name: product.seller.name, contact: product.seller.contact }
            : null,
            store: product.direct_store
            ? { id: product.direct_store.direct_store_id, name: product.direct_store.name }
            : null,
            detail_page: {
                figma_export_url: `https://figma.baro.com/export/${product.product_id}`,
                page_status: '공개'
            }
        }
    });

    } catch (err) {
        console.error('상품 상세 조회 오류:', err);
        res.status(500).json({
            status: 'error',
            code: 'SERVER_ERROR',
            message: '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
        });
    }
};