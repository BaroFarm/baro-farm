import { Outlet } from 'react-router-dom';
import Header from '../common/Header'; // 네비게이션 헤더 컴포넌트

export default function Layout() {
    return (
    <>
        <Header />
            <main>
                <Outlet /> {/* 여기에 현재 라우트에 해당하는 페이지가 들어옴 */}
            </main>
        </>
    );
}
