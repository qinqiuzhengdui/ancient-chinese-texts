import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { User, BookOpen, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getUserProfile, type UserProfile } from '../services/user';
import './Layout.css';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getUserProfile()
        .then(data => setUser(data))
        .catch(() => {
          localStorage.removeItem('token');
          setUser(null);
        });
    } else {
      setUser(null);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  const navItems = [
    { name: '首页', path: '/' },
    { name: '全文数据', path: '/full-text' },
    { name: '高清化模型', path: '/hd-models' },
    { name: '高清化核对', path: '/hd-verification' },
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
            {user ? (
              <div className="user-menu" style={{ display: 'flex', alignItems: 'center', marginLeft: '12px', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }} onClick={() => navigate('/personal-center')}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#2f4f4f', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="user-name" style={{ fontWeight: 500, color: '#2c3e50' }}>{user.username}</span>
                </div>
                <button onClick={handleLogout} className="logout-btn btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px' }}>
                  <LogOut size={16} />
                  退出
                </button>
              </div>
            ) : (
              <Link to="/login" className="login-btn btn btn-outline" style={{ marginLeft: '12px' }}>
                登录/注册
              </Link>
            )}
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
