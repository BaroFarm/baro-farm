'use strict';

/**
 * 쿠폰 시더
 * - [SEED] 접두어 2건 삽입
 * - 이미 있으면(이름 중복) 건너뜀 → idempotent
 * - 유효기간: 어제 ~ +30일, closed_at: +1년, is_available=1
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const Op = Sequelize.Op;

    // 이미 존재하는지 확인
    const [rows] = await queryInterface.sequelize.query(
      "SELECT name FROM coupon WHERE name IN ('[SEED] 5,000원 할인', '[SEED] 10% (최대 1만원)')"
    );
    const exists = new Set(rows.map(r => r.name));

    const now = new Date();
    const dayMs = 24 * 60 * 60 * 1000;
    const validFrom = new Date(now.getTime() - 1 * dayMs);       // 어제
    const validAt   = new Date(now.getTime() + 30 * dayMs);      // +30일
    const closedAt  = new Date(now.getTime() + 365 * dayMs);     // +1년

    const toInsert = [];

    if (!exists.has('[SEED] 5,000원 할인')) {
      toInsert.push({
        name:              '[SEED] 5,000원 할인',
        type:              'amount',            // enum('percent','amount')
        value:             5000,                // 정액 5,000원
        min_order_account: 30000.00,            // DECIMAL(10,2)
        max_discount:      null,
        is_available:      1,                   // TINYINT(1)
        created_at:        now,                 // DATETIME
        closed_at:         closedAt,
        valid_from:        validFrom,
        valid_at:          validAt,
      });
    }

    if (!exists.has('[SEED] 10% (최대 1만원)')) {
      toInsert.push({
        name:              '[SEED] 10% (최대 1만원)',
        type:              'percent',           // 퍼센트
        value:             10,                  // 10%
        min_order_account: 0.00,
        max_discount:      10000.00,            // 상한 1만원
        is_available:      1,
        created_at:        now,
        closed_at:         closedAt,
        valid_from:        validFrom,
        valid_at:          validAt,
      });
    }

    if (toInsert.length) {
      await queryInterface.bulkInsert('coupon', toInsert);
    }
  },

  async down(queryInterface, Sequelize) {
    const Op = Sequelize.Op;
    await queryInterface.bulkDelete('coupon', {
      name: { [Op.in]: ['[SEED] 5,000원 할인', '[SEED] 10% (최대 1만원)'] }
    });
  }
};
