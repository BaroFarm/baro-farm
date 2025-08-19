const { Op } = require('sequelize');
const { Product, ProductImg } = require('../../models');

// 공용 절대경로 보정기 (getProducts에서 쓰던 그대로)
const toAbs = (req, p) =>
    /^https?:\/\//i.test(p) ? p : `${req.protocol}://${req.get('host')}${p.startsWith('/') ? '' : '/'}${p}`;

// 월별 제철 상품 목록 
const SEASONAL_KEYWORDS = {
    1: ["귤", "레몬", "우엉", "연근", "당근", "굴", "문어", "해삼", "대구", "명태", "도미", "옥돔", "아귀", "가자미"],
    2: ["딸기", "귤", "레몬", "한라봉", "쑥갓", "시금치", "고비", "봄동", "참취", "순무", "양파", "달래", "청각", "다시마", "파래", "전복", "굴", "꼬막", "홍어", "홍합"],
    3: ["딸기", "한라봉", "우엉", "냉이", "더덕", "취나물", "쑥", "씀바귀", "돌미나리", "바지락", "꼬막", "주꾸미", "도미", "소라", "멸치"],
    4: ["딸기", "달래", "냉이", "두릅", "더덕", "취나물", "쑥", "상추", "봄동", "아스파라거스", "미더덕", "소라", "도기", "조기", "뱅어포", "병어", "키조개", "김", "갈치", "고등어", "꽃게", "주꾸미"],
    5: ["딸기", "매실", "앵두", "하귤", "두릅", "취나물", "양배추", "고구마순", "상추", "파", "양파", "마늘", "더덕", "마늘종", "완두", "미나리", "도라지", "멍게", "참치", "홍어", "넙치", "오징어", "준치"],
    6: ["토마토", "참외", "매실", "복분자", "하귤", "수박", "감자", "샐러리", "껍질콩", "양파", "근대", "부추", "청동호박", "장어", "다슬기", "참다랑어", "소라", "흑돔", "병어", "준치", "삼치", "전갱이", "오징어", "바닷가재"],
    7: ["수박", "딸기", "참외", "산딸기", "자두", "아보카도", "배", "사과", "포도", "석류", "무화과", "블루배리", "복숭아", "복분자", "부추", "양배추", "가지", "피망", "애포박", "노각", "열무", "감자", "토마토", "도라지", "옥수수", "장어", "홍어", "농어", "갑오징어", "병어"],
    8: ["멜론", "복숭아", "포도", "수박", "블루베리", "참외", "자두", "오이", "풋고추", "열무", "양상추", "깻잎", "감자", "고구마순", "옥수수", "전복", "성게", "잉어", "장어", "전갱이"],
    9: ["배", "귤", "석류", "블루베리", "배", "사과", "포도", "수박", "석류", "무화과", "고구마", "감자", "픗콩", "토란", "느타리버섯", "당근", "붉은 고추", "표고버섯", "옥수수", "참나무", "부추", "해파리", "굴", "게", "고등어", "대하", "전복", "갈치", "광어"],
    10: ["배", "귤", "석류", "사과", "감", "밤", "대추", "송이버섯", "고추", "팥", "무", "느타리버섯", "양송이버섯", "고들삐기", "고구마", "무", "늙은 호박", "꽁치", "고등어", "청어", "갈치", "연어", "대하", "홍합", "굴", "게", "전복", "대하", "삼치", "갈치", "광어", "해삼"],
    11: ["배", "사과", "귤", "키위", "배추", "무", "연근", "당근", "우엉", "파", "늙은 호박", "은행", "유자", "브로콜리", "삼치", "도미", "광어", "해삼", "과메기", "꽃게", "방어", "옥돔", "연어", "참치", "참돔", "대구", "성게", "오징어"],
    12: ["귤", "바나나", "유자", "사과", "한라봉", "콜리플라워", "산마", "배추", "무", "브로콜리", "명태", "아귀", "도미", "가리비", "광어", "과메기", "굴", "홍합", "꼬막", "대하", "삼치"]
};

exports.getSeasonalProducts = async (req, res) => {
    console.log("[seasonal] hit", { q: req.query, now: new Date().toISOString() });
    try {
        let { limit = 20 } = req.query;
        limit = parseInt(limit, 10);

        // limit 검증
        if (isNaN(limit) || limit <= 0 || limit > 100) {
            return res.status(400).json({
                status: 'error',
                code: 'INVALID_LIMIT',
                message: 'limit 값은 1 이상 100 이하의 숫자여야 합니다.'
            });
        }

        // 월 계산 
        const monthNum = new Date().getMonth() + 1; 
        
        const keywords = SEASONAL_KEYWORDS[monthNum] || [];
        if (keywords.length === 0) {
            return res.status(404).json({
                status: 'error',
                code: 'NO_SEASONAL_KEYWORDS',
                message: `${monthNum}월에 해당하는 제철 상품 키워드가 없습니다.`
            });
        }

        // 조건 구성: title LIKE '%키워드%'
        const titleLikeOr = keywords.map(kw => ({
            title: { [Op.like]: `%${kw}%` }
        }));

        const products = await Product.findAll({
            where: { [Op.or]: titleLikeOr },
            limit,
            attributes: ['product_id', 'title', 'price'],
            include: [
                {
                    model: ProductImg,
                    as: 'images',
                    attributes: ['img_url', 'img_order', 'img_id'],
                    required: false,
                    separate: true,       // 대표 한 장만
                    limit: 1,
                    order: [['img_order', 'ASC'], ['img_id', 'ASC']],
                },
            ],
            order: [['product_id', 'DESC']], // 임의 정렬 (원하면 바꿔도 됨)
        });

        if (!products || products.length === 0) {
            return res.status(404).json({
                status: 'error',
                code: 'NO_SEASONAL_PRODUCTS',
                message: '해당 월에 제철 상품이 없습니다.'
            });
        }

        const data = products.map(p => {
            //id: String(p.product_id),
            const first = p.images?.[0]?.img_url || null;
            const imageUrl = first ? toAbs(req, first) : toAbs(req, '/images/mock/no-image-240.png');
            return{
                id: p.product_id,                         // 숫자로 통일
                title: p.title,
                price: p.price,
                image_url: imageUrl,                      // ✅ 하드코딩 CDN 제거
                is_subscription_available: false,
                average_rating: 4.7,
            };             
        });

        return res.status(200).json({
            status: 'success',
            data
        });

    } catch (err) {
        console.error('제철 상품 조회 오류:', err);
        return res.status(500).json({
            status: 'error',
            code: 'SERVER_ERROR',
            message: '서버 내부 오류가 발생했습니다.'
        });
    }
};