import './App.css';
import Layout from './components/layout/Layout';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ShopPage from "./pages/ShopPage";
import CategoryPage from "./pages/CategoryPage";
import LoginPage from './pages/LoginPage';

function App() {

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* 로그인 페이지: Header 안 보이게 */}
          <Route path="/login" element={<LoginPage />} />

          {/* 나머지 페이지는 Layout으로 감싸기 */}
          <Route element={<Layout />}>
            <Route path="/" element={<ShopPage />} />
            <Route path="/shop/:category" element={<CategoryPage />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
