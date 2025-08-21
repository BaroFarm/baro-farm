import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

export default function StarRating({ value, size }) {
    const numericRating = parseFloat(value); // ⭐ 문자열도 숫자로 변환
    const stars = [];

    for (let i = 1; i <= 5; i++) {
        if (numericRating >= i) {
            stars.push(<FaStar key={i} size={size} color="#ffd700" />);
        } else if (numericRating >= i - 0.5) {
            stars.push(<FaStarHalfAlt key={i} size={size} color="#ffd700" />);
        } else {
            stars.push(<FaRegStar key={i} size={size} color="#ccc" />);
        }
    }

    return <div style={{ display: 'flex', gap: '4px' }}>{stars}</div>;
}
