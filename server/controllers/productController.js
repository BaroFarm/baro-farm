const { Product, Category } = require('../models');
const { Op } = require('sequelize');

exports.getProducts = async (req, res) => {
    try {
        // Query parameters: category, sort, page, limit
        const {
            category,
            sort = 'latest',
            page = 1,
            limit = 20
        } = req.query;
        
        const validSorts = ['latest', 'popular', 'price_asc', 'price_desc'];

        // 400 Bad Request: Validate query parameters 
        if (!validSorts.includes(sort)) {
            return res.status(400).json({
                error: {
                code: 400,
                message: "Invalid query parameters: 'sort' must be one of [latest, popular, price_asc, price_desc]"
                }
            });
        }

        const order = {
            latest: [['created_at', 'DESC']],
            popular: [['price', 'DESC']], // 향후 판매량 등으로 대체
            price_asc: [['price', 'ASC']],
            price_desc: [['price', 'DESC']]
        }[sort];

        const where = {};
        if (category) {
            where['$category.category_name$'] = { [Op.like]: `%${category}%` };
        }

        const offset = (page - 1) * limit;

        const { count, rows } = await Product.findAndCountAll({
            where,
            order,
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['category_name']
                }
            ],
            offset: parseInt(offset),
            limit: parseInt(limit),
            attributes: [
                'product_id',
                ['title', 'name'],
                'price',
                'created_at'
            ]
        });

        // 404 Not Found: If no products found
        if (rows.length === 0) {
            return res.status(404).json({
                error: {
                    code: 404,
                    message: "Products not found"
                }
            });
        }

        const totalPages = Math.ceil(count / limit);

        // 200 OK: Return paginated product list
        res.status(200).json({
            status: 'success',
            pagination: {
                current_page: parseInt(page),
                total_pages: totalPages,
                total_products: count
        },
        products: rows.map(p => ({
            product_id: p.product_id,
            name: p.name,
            price: p.price,
            category: p.category?.category_name || null,
            image_url: 'https://cdn.baro.com/images/dummy.jpg',
            is_local: true,
            is_subscription_available: false,
            average_rating: 4.7
        }))
    });

    // 500 Internal Server Error: Handle unexpected errors
    } catch (error) {
            console.error('상품 목록 조회 오류:', error);
            res.status(500).json({
            error: {
                code: 500,
                message: 'Internal Server Error'
            }
        });
    }
};
