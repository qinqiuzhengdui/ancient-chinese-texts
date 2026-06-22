import { Link, Outlet, useLocation } from 'react-router-dom';
import { User, Search, BookOpen } from 'lucide-react';
import './Layout.css';

const Layout = () => {
  const location = useLocation();

  const navItems = [
    { name: '首页', path: '/' },
    { name: '全文数据', path: '/full-text' },
    { name: '高清化模型', path: '/hd-models' },
    { name: '古籍 OCR 识别', path: '/ocr' },
    { name: '知识图谱', path: '/knowledge-graph' },
    { name: '社区', path: '/community' },
    { name: 'AI 助手', path: '/ai-assistant' },
    { name: '法律条文', path: '/laws' },
    { name: '使用帮助', path: '/help' },
  ];

  return (
    <div className="layout-wrapper">
      <header className="top-nav glass-panel">
        <div className="nav-container">
          <div className="logo-area">
            <BookOpen className="logo-icon" size={28} />
            <span className="logo-text">古籍智慧化服务平台</span>
          </div>
          
          <nav className="nav-links">
            {navItems.map((item) => (
              <Link 
                key={item.path} 
                to={item.path}
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="nav-actions">
            <Link to="/personal-center" className="user-profile-btn">
              <User size={20} />
              <span>个人中心</span>
            </Link>
            <Link to="/login" className="login-btn btn btn-outline" style={{ marginLeft: '12px' }}>
              登录/注册
            </Link>
          </div>
        </div>
      </header>
      
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
