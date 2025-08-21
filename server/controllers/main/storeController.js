const { Product, DirectStore, Seller } = require('../../models');

exports.getStoreDetail = async (req, res) => {
    const storeId = parseInt(req.params.store_id, 10);

    if (!Number.isInteger(storeId) || storeId <= 0) {
        return res.status(400).json({
        status: 'error',
        code: 'INVALID_STORE_ID',
        message: '유효하지 않은 직매장 ID입니다.'
        });
    }

    try {
        // 직매장 정보, 판매자 연락처 조회 
        const storeRow = await DirectStore.findOne({
            where: { direct_store_id: storeId },
            attributes: ['direct_store_id', 'name', 'address'],
            include: [
            {   model: Seller,
                attributes: ['seller_id', 'contact', 'phone'], 
                required: false
            }]
        });

        const seller = storeRow.Seller || null;
        const phone = (seller && seller.contact) || (seller && seller.phone) || null;

        if (!storeRow) {
            return res.status(404).json({
                status: 'error',
                code: 'STORE_NOT_FOUND',
                message: '해당 직매장을 찾을 수 없습니다.'
            });
        }

        // 매장 상품 목록
        const products = await Product.findAll({
            where: { direct_store_id: storeId },
            attributes: [
                'product_id',
                ['title', 'name'],
                'weight',
                'price',
                'status'
            ],
            order: [['created_at', 'DESC']]
        });

        const productsDto = products.map(p => ({
            product_id: p.get('product_id'),
            name: p.get('name'),
            weight: p.get('weight'),
            price: p.get('price'),
            status: p.get('status'),
            image_url: `https://cdn.baro-farm.com/images/product/${p.get('product_id')}.jpg`
        }));

        // 이벤트 정보는 DB에 없으므로 빈 배열 반환
        const events = [];

        return res.status(200).json({
            status: 'success',
            data: {
                store: {
                    store_id: storeRow.get('direct_store_id'),
                    name: storeRow.get('name'),
                    address: storeRow.get('address'),
                    business_hours: null, // (임시) 
                    phone,
                    description: null,    // (임시) 
                },
                products: productsDto,
                events
            }
        });
    } catch (err) {
        console.error('직매장 상세 조회 오류:', err);
        return res.status(500).json({
            status: 'error',
            code: 'SERVER_ERROR',
            message: '서버 내부 오류가 발생했습니다.'
        });
    }
};