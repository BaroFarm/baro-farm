const categories = ['상품 설명', '상세정보', '후기', '문의'];

export default function ProductDetailNav({ selectedCategory, onSelectCategory }) {
    return (
        <nav style={navStyle}>
            <ul style={ulStyle}>
                {categories.map((label) => (
                    <li key={label} style={liStyle}>
                        <button
                            onClick={() => onSelectCategory(label)}
                            style={{
                                ...buttonStyle,
                                ...(selectedCategory === label ? selectedButtonStyle : {}),
                            }}
                        >
                            {label}
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

const navStyle = {
    borderBottom: '1px solid #ccc',
    maxWidth: '1152px',
    margin: '0 auto',
    backgroundColor: '#F6F7F5',
};

const ulStyle = {
    display: 'flex',
    margin: 0,
    padding: 0,
    listStyle: 'none',
};

const liStyle = {
  flex: 1, // 전체 가로 너비를 동일하게 분배
};

const buttonStyle = {
    width: '100%',
    padding: '16px 0',
    background: 'none',
    border: 'none',
    fontSize: '16px',
    color: '#666',
    cursor: 'pointer',
    borderBottom: '3px solid transparent',
    fontWeight: 'normal',
};

const selectedButtonStyle = {
    color: 'rgba(33, 94, 44, 1)',
    fontWeight: 'bold',
    //borderBottom: '3px solid #8DA291', // 선택된 탭 밑줄 강조
    backgroundColor: '#fff'
};
