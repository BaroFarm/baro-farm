const { VoucherProduct, VoucherUsage, IssueVoucher } = require('../../models');

const getMyVouchers = async (req, res) => {
  try {
    const customerId = req.user.customer_id; 

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;

    // 전체 보유 금액권 수 조회
    const totalElements = await VoucherProduct.count({
      include: [{
        model: IssueVoucher,
        where: { customer_id: customerId }
        }]
    });

    // 보유 금액권 목록 조회
    const vouchers = await VoucherProduct.findAll({
      include: [
        {
          model: IssueVoucher,
          where: { customer_id: customerId },
          include: [ 
            {
              model: VoucherUsage,
            }
          ],
        }
    ],
      limit: pageSize,
      offset,
      order: [[IssueVoucher, 'acquired_at', 'DESC']]
    });

    // 응답 가공
    const result = vouchers.map(voucher => {
        const iv = voucher.IssueVouchers[0]; 
        const usageRows = iv?.VoucherUsages || []; // include에 model: VoucherUsage 추가했으니 접근 가능
        const totalUsed = usageRows.reduce((sum, u) => sum + (u.used_amount || 0), 0);
        return {
            voucher_id: voucher.voucher_id,
            voucher_name: voucher.voucher_name,
            remaining_amount: iv ? iv.remaining_amount : null,
            amount: voucher.amount,
            acquired_at: iv ? iv.acquired_at : null,
            expired_at: iv ? iv.expired_at : null,
            status: iv ? iv.status : null,
            //추가
            refundable_date: voucher.refundable_date || null,
            total_used: totalUsed, 
        };
    });

    res.json({
      status: 'success',
      data: {
        result,
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

module.exports = getMyVouchers;