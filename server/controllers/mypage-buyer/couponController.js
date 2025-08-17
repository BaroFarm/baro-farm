const { Op } = require('sequelize');
const { Coupon, IssueCoupon } = require('../../models');

// 다운로드 가능한 쿠폰 목록 조회
const getDownloadableCoupons = async (req, res) => {
  try {
    const customerId = req.user.customer_id;

    // 이미 발급받은 쿠폰 id 조회
    const ownedCoupons = await IssueCoupon.findAll({
      where: { customer_id: customerId },
      attributes: ['coupon_id'],
      raw: true
    });
    const ownedIds = ownedCoupons.map(row => row.coupon_id);

    // UTC+9로 맞춤
    const now = new Date(Date.now() + 9 * 60 * 60 * 1000);

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * pageSize;
    
    // 다운로드 가능한 쿠폰 제한
    const whereClause = {
        is_available: true,
        valid_from: { [Op.lte]: now },
        valid_at: { [Op.gte]: now },
        [Op.or]: [
            { closed_at: null },
            { closed_at: { [Op.gte]: now } }
        ]
    };
    if (ownedIds.length > 0) {
    whereClause.coupon_id = { [Op.notIn]: ownedIds };
    }

    const totalElements = await Coupon.count({ where: whereClause });

    const coupons = await Coupon.findAll({
      where: whereClause,
      limit: pageSize,
      offset,
      order: [['valid_at', 'ASC']]
    });

    const downloadableCoupons = coupons.map((c) => ({
      coupon_id: c.coupon_id,
      coupon_name: c.name,
      type: c.type === 'amount' ? 'FIXED_AMOUNT' : 'PERCENTAGE',
      min_order_account: c.min_order_account ? Number(c.min_order_account) : null,
      max_discount: c.max_discount ? Number(c.max_discount) : null,
      valid_from: c.valid_from, 
      valid_at: c.valid_at,
      is_available: c.is_available
    }));

    res.json({
      status: 'success',
      data: {
        downloadableCoupons,
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
      message: '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    });
  }
};

// 보유 쿠폰 목록 조회
const getMyCoupons = async (req, res) => {
  try {
    const customerId = req.user.customer_id;

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * pageSize;

    const totalElements = await IssueCoupon.count({
      where: { customer_id: customerId }
    });
    
    const myCoupons = await IssueCoupon.findAll({
      where: { customer_id: customerId },
      include: [{ model: Coupon }],
      order: [['issued_at', 'DESC']],
      limit: pageSize,
      offset: offset
    });

  const coupons = myCoupons.map(item => ({
    issue_coupon_id: item.issue_coupon_id,
    coupon_id: item.coupon_id,
    coupon_name: item.Coupon?.name,
    type: item.Coupon?.type === 'percent' ? 'PERCENTAGE' : 'AMOUNT',
    discount_value: item.Coupon?.value,
    min_order_account: item.Coupon?.min_order_account ? Number(item.Coupon.min_order_account) : null,
    max_discount: item.Coupon?.max_discount ? Number(item.Coupon.max_discount) : null,
    valid_from: item.Coupon?.valid_from,
    valid_at: item.Coupon?.valid_at,
    issued_at: item.issued_at,
    status: item.status, 
    is_available: item.Coupon?.is_available
  }));

    res.status(200).json({
      status: 'success',
      data: {
        coupons,
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
      message: '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    });
  }
};

// 쿠폰 다운로드
const downloadCoupon = async (req, res) => {
  try {
    const customerId = req.user.customer_id;
    const { coupon_id } = req.body;

    // 이미 발급받았는지 체크
    const alreadyIssued = await IssueCoupon.findOne({
      where: { customer_id: customerId, coupon_id }
    });
    if (alreadyIssued) {
      return res.status(400).json({
        status: 'fail',
        code: 'ALREADY_ISSUED',
        message: '이미 발급받은 쿠폰입니다.'
      });
    }

    const now = new Date(Date.now() + 9 * 60 * 60 * 1000);

    // 쿠폰 유효성 체크
    const coupon = await Coupon.findOne({
    where: {
        coupon_id,
        is_available: true,
        valid_from: { [Op.lte]: now },
        valid_at: { [Op.gte]: now },
        [Op.or]: [
        { closed_at: null },
        { closed_at: { [Op.gte]: now } }
        ]
        }
    });

    if (!coupon) {
      return res.status(404).json({
        status: 'fail',
        code: 'INVALID_OR_EXPIRED',
        message: '쿠폰이 유효하지 않거나 기간이 만료되었습니다.'
      });
    }

    // 발급 처리
    await IssueCoupon.create({
        customer_id: customerId,
        coupon_id: coupon_id,
        issued_at: new Date(),
        status: 'issued',
    });

    res.json({ status: 'success', message: '쿠폰이 발급되었습니다.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      code: 'SERVER_ERROR',
      message: '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    });
  }
};

module.exports = { 
    getDownloadableCoupons, 
    getMyCoupons,
    downloadCoupon, 
};