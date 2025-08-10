
const { Op } = require('sequelize');
const { Product, Order, OrderProduct, ProductImg, StoreWishlist, ProductWishlist, Seller, Store, sequelize } = require('../models');

// 인기 상품 추천
async function getPopularProducts(limit) {
    const THIRTY_DAYS_AGO = new Date(Date.now() - 30*24*60*60*1000);

    // 주문 건수 집계
    const orderCounts = await OrderProduct.findAll({
        attributes: [
            'product_id',
            [sequelize.fn('COUNT', sequelize.col('order_product_id')), 'cnt']
        ],
        where: { created_at: { [Op.gte]: THIRTY_DAYS_AGO } },
        group: ['product_id'],
        order: [[sequelize.literal('cnt'), 'DESC']],
        raw: true,
        limit,
    });

    // 상품 찜 건수 집계
    const wishCounts = await ProductWishlist.findAll({
        attributes: [
            'product_id',
            [sequelize.fn('COUNT', sequelize.col('product_id')), 'cnt']
        ],
        where: { created_at: { [Op.gte]: THIRTY_DAYS_AGO } },
        group: ['product_id'],
        raw: true,
    });

    // 스토어 즐겨찾기 집계
    const storeFavCounts = await StoreWishlist.findAll({
        attributes: [
            'store_id',
            [sequelize.fn('COUNT', sequelize.col('store_id')), 'cnt']
        ],
        where: { created_at: { [Op.gte]: THIRTY_DAYS_AGO } },
        group: ['store_id'],
        raw: true,
    });

    // 집계 점수화
    const scoreMap = new Map();
    orderCounts.forEach(({ product_id, cnt }) => {
        scoreMap.set(product_id, (scoreMap.get(product_id) || 0) + Number(cnt) * 2);
    });
    wishCounts.forEach(({ product_id, cnt }) => {
        scoreMap.set(product_id, (scoreMap.get(product_id) || 0) + Number(cnt));
    });

    for (const { store_id, cnt } of storeFavCounts) {
        const products = await Product.findAll({
            include: [{
                model: Seller,
                where: { store_id }
            }],
            raw: true,
        });
        products.forEach(p => {
            scoreMap.set(p.product_id, (scoreMap.get(p.product_id) || 0) + Number(cnt));
        });
    }

    // 점수 순 정렬, 상위 N개 추출
    const ranked = [...scoreMap.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([product_id]) => product_id);

    const productsInfo = await Product.findAll({
        where: { product_id: ranked.slice(0, limit) },
        include: [{
            model: ProductImg,
            required: false,
            order: [['img_order', 'ASC']],
            limit: 1
        }],
    raw: false,
    });
    
    const productMap = {};
    productsInfo.forEach(p => { productMap[p.product_id] = p; });
    return ranked.map(pid => productMap[pid]).filter(Boolean);
}

// 개인화 추천
async function getContentBasedRecommendedProducts(userId, limit = 20) {
    // 찜/주문 내역
    const wish = await ProductWishlist.findAll({
        where: { customer_id: userId },
        attributes: ['product_id'],
        order: [['created_at', 'DESC']], // 최신순
        raw: true
    });
    const orders = await Order.findAll({
        where: { customer_id: userId },
        attributes: ['order_id'],
        raw: true
    });
    const orderIds = orders.map(o => o.order_id);
    let ordered = [];
    if (orderIds.length > 0) {
        ordered = await OrderProduct.findAll({
            where: { order_id: orderIds },
            attributes: ['product_id'],
            raw: true
        });
    }

    const myProductIds = [...new Set([...wish.map(w => w.product_id), ...ordered.map(o => o.product_id)])];

    // 찜/구매한 상품 정보
    const myProducts = myProductIds.length
        ? await Product.findAll({ where: { product_id: myProductIds }, raw: true })
        : [];
    const myProductMap = {};
    myProducts.forEach(p => { myProductMap[p.product_id] = p; });

    // 선호 카테고리 추출
    const productsInMyList = await Product.findAll({
        where: { product_id: myProductIds },
        attributes: ['category_id'],
        raw: true,
    });
    const categoryCount = {};
    for (const p of productsInMyList) {
        if (!p.category_id) continue;
        categoryCount[p.category_id] = (categoryCount[p.category_id] || 0) + 1;
    }
    const favoriteCategories = Object.entries(categoryCount)
        .sort((a, b) => b[1] - a[1])
        .map(([catId]) => catId);

    // 카테고리별 추천
    const alreadyRecommended = new Set(myProductIds);
    let categoryRestProducts = [];

    for (const categoryId of favoriteCategories) {
        // 인기순 추천
        const orderCounts = await OrderProduct.findAll({
            include: [{
                model: Product,
                where: { category_id: categoryId, product_id: { [Op.notIn]: Array.from(alreadyRecommended) } }
            }],
            attributes: [[sequelize.col('OrderProduct.product_id'), 'product_id']],
            group: ['OrderProduct.product_id'],
            order: [[sequelize.fn('COUNT', sequelize.col('OrderProduct.order_product_id')), 'DESC']],
            raw: true,
        });
        const categoryPopularIds = orderCounts.map(r => r.product_id);

        // 인기 없는 나머지 상품
        const alreadyIncluded = new Set([...alreadyRecommended, ...categoryPopularIds]);
        const remainProducts = await Product.findAll({
            where: {
                category_id: categoryId,
                product_id: { [Op.notIn]: Array.from(alreadyIncluded) }
            },
            attributes: ['product_id'],
            raw: true
        });
        const remainProductIds = remainProducts.map(p => p.product_id);

        // 카테고리별 순서 유지해서 추가
        for (const pid of [...categoryPopularIds, ...remainProductIds]) {
            if (alreadyRecommended.size >= limit) break;
            if (!alreadyRecommended.has(pid)) {
                categoryRestProducts.push(pid);
                alreadyRecommended.add(pid);
            }
        }
        if (alreadyRecommended.size >= limit) break;
    }

    let resultIds = [...myProductIds, ...categoryRestProducts];

    // 부족하면 인기상품으로 채움
    if (resultIds.length < limit) {
        const popular = await getPopularProducts(limit * 2);
        for (const p of popular) {
            if (!resultIds.includes(p.product_id)) resultIds.push(p.product_id);
            if (resultIds.length >= limit) break;
        }
    }
    const productsInfo = await Product.findAll({
        where: { product_id: resultIds.slice(0, limit) },
        include: [{
            model: ProductImg,
            required: false,
            order: [['img_order', 'ASC']],
            limit: 1
        }],
    raw: false,
    });

    const infoMap = {};
    productsInfo.forEach(p => { infoMap[String(p.product_id)] = p; });

    const finalResult = resultIds.slice(0, limit).map(pid => infoMap[String(pid)]).filter(Boolean);
    return finalResult;
}

module.exports = {
    getPopularProducts, 
    getContentBasedRecommendedProducts
};
