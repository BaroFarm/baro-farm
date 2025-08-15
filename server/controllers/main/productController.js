const { Product, Seller, Category, DirectStore, ProductImg } = require('../../models');
const { Op } = require('sequelize');

const toAbs = (req, p) =>
  /^https?:\/\//i.test(p) ? p : `${req.protocol}://${req.get('host')}${p.startsWith('/') ? '' : '/'}${p}`;

const imageIncludeOne = {
  model: ProductImg,
  as: 'images',
  attributes: ['img_url', 'img_order'],
  separate: true,              // 목록 성능/중복 방지
  limit: 1,                    // 대표 1장
  order: [
    ['img_order', 'ASC'],      // 대표 0 먼저
    ['img_id', 'ASC'],
    ['created_at', 'ASC'],
  ],
};

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
        { model: Category, as: 'category', attributes: ['category_name'] },
        imageIncludeOne,
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
        // ✅ 로컬 이미지 우선
        const local = p.images?.[0]?.img_url || null;
        const img = local ? toAbs(req, local) : toAbs(req, '/images/mock/no-image-240.png');
        
        return {
          product_id: p.product_id,
          name,
          price: p.price,
          category: p.category?.category_name || null,
          // 상품마다 안정적으로 다른 이미지 + 새로고침에도 유지
          image_url: img,
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
  // :product_id 또는 :productId 모두 허용
  const pidRaw = req.params.product_id ?? req.params.productId;
  const productId = Number(pidRaw);
  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({
      status: 'error',
      code: 'INVALID_ID',
      message: '유효하지 않은 상품 ID입니다. 숫자 형식이어야 합니다.',
    });
  }

  try {
    const product = await Product.findOne({
      where: { product_id: productId },
      attributes: [
        // ⛔ image_url 제거 (테이블에 없음)
        'product_id', 'title', 'price', 'weight', 'status', 'description',
        'returnable', 'regular_delivery',
        'is_video', 'video_url',
        'figma_export_url',
        'created_at', 'updated_at',
      ],
      include: [
        { model: Category, as: 'category', attributes: ['category_id', 'category_name'] },
        { model: Seller, as: 'seller', attributes: ['seller_id', 'name', 'contact'] },
        { model: DirectStore, as: 'direct_store', attributes: ['direct_store_id', 'name'] },
        {
          model: ProductImg,
          as: 'images',
          attributes: ['img_url', 'img_order', 'img_id', 'created_at'],
        },
      ],
      // ✅ include 내부 order 대신 최상위 order로 이미지 정렬 보장
      order: [
        [{ model: ProductImg, as: 'images' }, 'img_order', 'ASC'],
        [{ model: ProductImg, as: 'images' }, 'img_id', 'ASC'],
      ],
    });

    if (!product) {
      return res.status(404).json({
        status: 'error',
        code: 'NOT_FOUND',
        message: '해당 상품을 찾을 수 없습니다.',
      });
    }

    // 대표 이미지(없으면 placeholder)
    const first = product.images?.[0]?.img_url || null;
    const imageUrl = first ? toAbs(req, first) : toAbs(req, '/images/mock/no-image-240.png');

    // 전체 이미지 목록 {url, order}
    const images = (product.images || []).map(i => ({
      url: toAbs(req, i.img_url),
      order: i.img_order ?? 0,
    }));

    // 비디오/상세 경로 절대화
    const video_url = product.video_url ? toAbs(req, product.video_url) : null;

    const detail_page = product.figma_export_url
      ? { figma_export_url: toAbs(req, product.figma_export_url), page_status: '공개' }
      : { figma_export_url: `https://figma.baro.com/export/${product.product_id}`, page_status: '공개' }; // 없으면 임시 fallback

    return res.status(200).json({
      status: 'success',
      data: {
        id: product.product_id,
        title: product.title,
        price: product.price,
        weight: product.weight,
        status: product.status,
        description: product.description,

        image_url: imageUrl,   // ✅ 여기서 만든 대표 이미지
        images,                // ✅ 배열로 내려줌

        is_returnable: !!product.returnable,
        is_subscription: !!(product.regular_delivery ?? false),

        is_video: !!product.is_video,
        video_url,

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

        detail_page,
      },
    });
  } catch (err) {
    console.error('상품 상세 조회 오류:', err);
    return res.status(500).json({
      status: 'error',
      code: 'SERVER_ERROR',
      message: '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    });
  }
};
