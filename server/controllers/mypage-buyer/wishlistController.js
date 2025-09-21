const { StoreWishlist, Store, ProductWishlist, Product, ProductImg } = require('../../models');

// 스토어 즐겨찾기 목록 조회
const getFavoriteStores = async (req, res) => {
    try {
        const customerId = req.user.customer_id;
        
        // 페이지 정보
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const offset = (page - 1) * pageSize;

        // 전체 즐겨찾기 개수
        const totalElements = await StoreWishlist.count({
            where: { customer_id: customerId }
        });

        const favorites = await StoreWishlist.findAll({
        where: { customer_id: customerId },
        include: [
            {
            model: Store,
            attributes: ['store_id', 'name'],
            }
        ],
        limit: pageSize,
        offset,
        order: [['created_at', 'DESC']]
        });

        // 응답 형식에 맞춰 매핑
        const favoriteStores = (favorites || []).map(fav => ({
            store_wishlist_id: fav.store_wishlist_id ?? null, 
            store_id: fav.Store?.store_id ?? null, 
            store_name: fav.Store?.name ?? null, 
            created_at: fav.created_at ?? null, 
        }));

        res.status(200).json({
          status: 'success',
          data: {
            favoriteStores,
            pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalElements / pageSize),
            totalElements,
            pageSize
            }
          }
        });

    } catch (err) {
    console.error(err);
    res.status(500).json({
        status: 'error',
        code: 'SERVER_ERROR',
        message: '서버 내부 오류가 발생했습니다.'
    });
    }
}

// 상품 찜 목록 조회
const getProductWishlists = async (req, res) => {
    try {
        const customerId = req.user.customer_id;
        
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const offset = (page - 1) * pageSize;

        const totalElements = await ProductWishlist.count({
            where: { customer_id: customerId }
        });

        const wishlists = await ProductWishlist.findAll({
        where: { customer_id: customerId },
        attributes: ['product_wishlist_id', 'created_at'],
        include: [
            {
            model: Product,
            as:'Product',
            attributes: ['product_id', 'title', 'price'],
            include: [
                { model: ProductImg, 
                    as: 'images',
                    attributes: ['img_url'], required: false }
            ]
            }
        ],
        limit: pageSize,
        offset,
        order: [['created_at', 'DESC']]
        });

        // 응답 형식에 맞춰 매핑
        const productWishlists = (wishlists || []).map(wish => ({
            product_wishlist_id: wish.product_wishlist_id ?? null, 
            product_id: wish.Product?.product_id ?? null, 
            product_name: wish.Product?.title ?? null, 
            price: wish.Product?.price ?? null, 
            img_url: wish.Product?.ProductImg?.[0]?.img_url || null,
            created_at: wish.created_at ?? null, 
        }));

        res.status(200).json({
          status: 'success',
          data: {
            productWishlists,
            pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalElements / pageSize),
            totalElements,
            pageSize
            }
          }
        });

    } catch (err) {
    console.error(err);
    res.status(500).json({
        status: 'error',
        code: 'SERVER_ERROR',
        message: '서버 내부 오류가 발생했습니다.'
    });
    }
}

module.exports = { getFavoriteStores, getProductWishlists };
