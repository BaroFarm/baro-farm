import Header from '../common/Header'; // 네비게이션 헤더 컴포넌트

export default function Layout({ children }) {
    return (
    <>
        <Header />
        <main>{children}</main>
    </>
    );
}
