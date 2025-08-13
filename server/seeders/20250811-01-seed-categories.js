'use strict';

const now = new Date();
const rows = [
  { category_id: 1, category_name: '쌀, 잡곡',         },
  { category_id: 2, category_name: '채소, 버섯',       },
  { category_id: 3, category_name: '과일, 견과',       },
  { category_id: 4, category_name: '축산, 축산가공',   },
  { category_id: 5, category_name: '수산물',           },
  { category_id: 6, category_name: '반찬, 양념, 가루', },
  { category_id: 7, category_name: '식사대용, 간편식', },
  { category_id: 8, category_name: '간식, 음료, 유제품', },
  { category_id: 9, category_name: '건강, 차',         },
];

module.exports = {
  async up (queryInterface) {
    await queryInterface.bulkInsert('category', rows, {});
  },
  async down (queryInterface) {
    await queryInterface.bulkDelete('category', {
      category_id: rows.map(r => r.category_id)
    }, {});
  }
};
