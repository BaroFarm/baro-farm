const { Category } = require('../../models'); 

exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({
            attributes: [['category_id', 'id'], ['category_name', 'name']],
            order: [['category_id', 'ASC']]
        });

        res.status(200).json({
            status: 'success',
            data: categories
        });
    } catch (error) {
            console.error('카테고리 조회 실패:', error);
            res.status(500).json({
                status: 'error',
                message: '서버 내부 오류가 발생했습니다.'
        });
    }
};
