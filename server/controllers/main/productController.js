const { Product, Seller, Category, DirectStore } = require('../../models');
const { Op } = require('sequelize');

exports.getProducts = async (req, res) => {
  try {
    // 쿼리 파라미터 추출 및 보정
    const sort = (req.query.sort ?? 'latest').toString();
    const page = Math.max(1, parseInt(req.query.page ?? 1, 10));
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit ?? 20, 10)));
    const category = req.query.category?.toString().trim();

    // 정렬 값 검증
    const validSorts = ['latest', 'popular', 'price_asc', 'price_desc'];
    if (!validSorts.includes(sort)) {
      return res.status(400).json({
        error: { code: 400, message: "'sort' 값이 유효하지 않습니다. [latest, popular, price_asc, price_desc]" }
      });
    }

    const order =
      sort === 'price_asc' ? [['price', 'ASC']] :
      sort === 'price_desc' ? [['price', 'DESC']] :
      sort === 'popular' ? [['price', 'DESC']] : // TODO: 판매량/조회수로 교체
      [['created_at', 'DESC']];

    // 필터
    const where = {};
    if (category) where['$category.category_name$'] = { [Op.like]: `%${category}%` };

    const offset = (page - 1) * limit;

    // 조회
    const { count, rows } = await Product.findAndCountAll({
      where,
      order,
      include: [
        { model: Category, as: 'category', attributes: ['category_name'] }
      ],
      offset,
      limit,
      attributes: ['product_id', ['title', 'name'], 'price', 'created_at'],
      subQuery: false,
      distinct: true
    });

    // 0건이어도 success + 빈 배열로 반환(프론트 안전)
    const total = typeof count === 'number' ? count : (Array.isArray(count) ? count.length : 0);
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return res.status(200).json({
      status: 'success',
      pagination: {
        current_page: page,
        total_pages: totalPages,
        total_products: total
      },
      products: rows.map(p => {
        const name = p.get('name') ?? p.title ?? '상품';
        const cat = p.category?.category_name || '';
        const keyword = cat ? `${name},${cat}` : name; // 검색 정확도 ↑
        return {
          product_id: p.product_id,
          name,
          price: p.price,
          category: p.category?.category_name || null,
          // 상품마다 안정적으로 다른 이미지 + 새로고침에도 유지
          image_url: `https://source.unsplash.com/400x300/?${encodeURIComponent(keyword)}&sig=${p.product_id}`,
          is_local: true,
          is_subscription_available: false,
          average_rating: 4.7
        };
      })
    });
  } catch (error) {
    console.error('상품 목록 조회 오류:', error);
    return res.status(500).json({
      error: { code: 500, message: '서버 내부 오류가 발생하였습니다.' }
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
        { model: Category, as: 'category', attributes: ['category_id', 'category_name'] },
        { model: Seller, as: 'seller', attributes: ['seller_id', 'name', 'contact'] },
        { model: DirectStore, as: 'direct_store', attributes: ['direct_store_id', 'name'] }
      ]
    });

    if (!product) {
      return res.status(404).json({
        status: 'error',
        code: 'NOT_FOUND',
        message: '해당 상품을 찾을 수 없습니다.'
      });
    }

    const keyword = product.title ?? product.category?.category_name ?? 'local food';

    return res.status(200).json({
      status: 'success',
      data: {
        id: product.product_id,
        title: product.title,
        price: product.price,
        weight: product.weight,
        status: product.status,
        description: product.description,
        image_url: `https://source.unsplash.com/400x300/?${encodeURIComponent(keyword)}&sig=${product.product_id}`,
        is_returnable: product.returnable,
        is_subscription: product.is_subscription_available ?? false,
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
    return res.status(500).json({
      status: 'error',
      code: 'SERVER_ERROR',
      message: '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    });
  }
};
