const { sequelize, Product, Seller, Category, DirectStore, ProductImg } = require('../../models');
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

    const validSorts = ['latest', 'popular', 'price_asc', 'price_desc'];
    if (!validSorts.includes(sort)) {
      return res.status(400).json({
        error: { code: 400, message: "'sort' 값이 유효하지 않습니다. [latest, popular, price_asc, price_desc]" }
      });
    }

    const offset = (page - 1) * limit;

    // 최종 정렬(중복 제거 후에 적용)
    const finalOrderSql =
      sort === 'price_asc'  ? 'r.price ASC' :
      sort === 'price_desc' ? 'r.price DESC' :
      sort === 'popular'    ? 'r.review_count DESC, r.created_at DESC' :
                              'r.created_at DESC'; // latest

    // 카테고리 필터
    const whereClauses = [];
    const repl = { offset, limit };
    if (category) {
      whereClauses.push('c.category_name LIKE :categoryLike');
      repl.categoryLike = `%${category}%`;
    }
    const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // 동일(제목+셀러) 그룹에서 대표 1개(rn=1)만 남기는 CTE
    // 주의: 윈도우 ORDER BY 안에서는 별칭(has_image 등) 사용 불가 → 표현식을 그대로 넣음
    const cte = `
      WITH base AS (
        SELECT
          p.product_id, p.category_id, p.seller_id, p.direct_store_id,
          p.title, p.status, p.weight, p.price, p.description, p.intro,
          p.figma_export_url, p.is_video, p.video_url, p.created_at, p.updated_at,
          c.category_name,
          /* 리뷰 수 */
          (SELECT COUNT(*) FROM review r WHERE r.product_id = p.product_id) AS review_count,
          /* 이미지 보유 여부 */
          CASE WHEN EXISTS (SELECT 1 FROM product_img i WHERE i.product_id = p.product_id) THEN 1 ELSE 0 END AS has_image
        FROM product p
        LEFT JOIN category c ON c.category_id = p.category_id
        ${whereSql}
      ),
      ranked AS (
        SELECT
          b.*,
          ROW_NUMBER() OVER (
            PARTITION BY LOWER(REPLACE(COALESCE(b.title,''),' ','')), COALESCE(b.seller_id,0)
            ORDER BY
              ((COALESCE(b.review_count,0) > 0)) DESC,                  -- 리뷰 있는 상품 우선
              (CASE WHEN b.has_image = 1 THEN 1 ELSE 0 END) DESC,       -- 이미지 있는 상품 우선
              (CASE WHEN b.status = '판매중' THEN 1 ELSE 0 END) DESC,    -- 판매중 우선
              COALESCE(b.updated_at, b.created_at) DESC,
              b.product_id DESC
          ) AS rn
        FROM base b
      )
    `;

    // 총 개수(중복 제거 후)
    const totalSql = `
      ${cte}
      SELECT COUNT(*) AS total
      FROM ranked
      WHERE rn = 1
    `;
    const [totalRow] = await sequelize.query(totalSql, {
      replacements: repl,
      type: sequelize.QueryTypes.SELECT
    });
    const total = Number(totalRow?.total ?? 0);
    const totalPages = Math.max(1, Math.ceil(total / limit));

    // 페이지 데이터
    const pageSql = `
      ${cte}
      SELECT
        r.product_id,
        r.title AS name,
        r.price,
        r.category_name,
        r.created_at,
        r.review_count,
        /* 대표 이미지 1장 */
        (
          SELECT img_url
          FROM product_img i
          WHERE i.product_id = r.product_id
          ORDER BY i.img_order ASC, i.img_id ASC
          LIMIT 1
        ) AS image_rel
      FROM ranked r
      WHERE r.rn = 1
      ORDER BY ${finalOrderSql}
      LIMIT :offset, :limit
    `;
    const rows = await sequelize.query(pageSql, {
      replacements: repl,
      type: sequelize.QueryTypes.SELECT
    });

    // 응답 매핑 (이미지 절대경로화)
    const products = rows.map(p => {
      const img = p.image_rel ? toAbs(req, p.image_rel) : toAbs(req, '/images/mock/no-image-240.png');
      return {
        product_id: p.product_id,
        name: p.name ?? '상품',
        price: p.price,
        category: p.category_name || null,
        image_url: img,
        is_local: true,
        is_subscription_available: false,
        average_rating: 0,          // 필요하면 review_count로 가중치 로직 추가 가능
        review_count: p.review_count
      };
    });

    return res.status(200).json({
      status: 'success',
      pagination: {
        current_page: page,
        total_pages: totalPages,
        total_products: total
      },
      products
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
        'product_id', 'title', 'price', 'weight', 'status', 'description','intro',
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
        intro: product.intro ?? '',

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
