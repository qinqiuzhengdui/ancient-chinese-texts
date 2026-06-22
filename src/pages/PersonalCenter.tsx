import { useState } from 'react';
import { User, Bookmark, Edit3, Image as ImageIcon, MessageCircle } from 'lucide-react';
import './PersonalCenter.css';

const PersonalCenter = () => {
  const [activeTab, setActiveTab] = useState('info');

  const menuItems = [
    { id: 'info', label: '个人信息', icon: <User size={18} /> },
    { id: 'collection', label: '我的收藏', icon: <Bookmark size={18} /> },
    { id: 'notes', label: '我的笔记', icon: <Edit3 size={18} /> },
    { id: 'images', label: '我的图片', icon: <ImageIcon size={18} /> },
    { id: 'feedback', label: '问题反馈', icon: <MessageCircle size={18} /> },
  ];

  return (
    <div className="pc-container">
      <aside className="pc-sidebar glass-panel">
        <div className="pc-user-summary">
          <div className="pc-avatar">
            <User size={40} color="var(--color-white)" />
          </div>
          <h3 className="pc-username">古籍研究者_001</h3>
          <p className="pc-role">普通用户</p>
        </div>
        
        <nav className="pc-nav">
          {menuItems.map(item => (
            <button 
              key={item.id}
              className={`pc-nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="pc-content glass-panel">
        {activeTab === 'info' && (
          <div className="pc-section">
            <h2 className="pc-section-title font-serif">个人基本信息</h2>
            <form className="pc-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">用户登录名</label>
                  <input type="text" className="form-control" defaultValue="user_001" disabled />
                </div>
                <div className="form-group">
                  <label className="form-label">用户姓名</label>
                  <input type="text" className="form-control" placeholder="您的真实姓名" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">出生日期</label>
                  <input type="date" className="form-control" />
                </div>
                <div className="form-group">
                  <label className="form-label">性别</label>
                  <select className="form-control">
                    <option>请选择</option>
                    <option>男</option>
                    <option>女</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">手机号码</label>
                  <input type="tel" className="form-control" defaultValue="13800138000" />
                </div>
                <div className="form-group">
                  <label className="form-label">用户邮箱</label>
                  <input type="email" className="form-control" defaultValue="user@example.edu.cn" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">学历</label>
                  <input type="text" className="form-control" placeholder="如：博士" />
                </div>
                <div className="form-group">
                  <label className="form-label">职称</label>
                  <input type="text" className="form-control" placeholder="如：研究员" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">邮政地址</label>
                <input type="text" className="form-control" placeholder="请输入详细地址" />
              </div>
              <div className="form-group">
                <label className="form-label">邮政编码</label>
                <input type="text" className="form-control" placeholder="请输入邮政编码" />
              </div>
              
              <button type="button" className="btn-primary pc-save-btn">保存修改</button>
            </form>
          </div>
        )}

        {activeTab === 'collection' && (
          <div className="pc-section">
             <h2 className="pc-section-title font-serif">我的收藏 (针对全文数据设计)</h2>
             <div className="placeholder-box">
                <Bookmark size={48} color="var(--color-border)" />
                <p>您还没有收藏任何古籍，快去全文数据模块看看吧！</p>
             </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="pc-section">
             <h2 className="pc-section-title font-serif">我的笔记 (记录随笔)</h2>
             <div className="placeholder-box">
                <Edit3 size={48} color="var(--color-border)" />
                <p>这里将展示您在 AI 助手 Notebook 中保存的所有研究随笔。</p>
             </div>
          </div>
        )}

        {activeTab === 'images' && (
          <div className="pc-section">
             <h2 className="pc-section-title font-serif">我的图片</h2>
             <p className="pc-desc">存储高清化和 OCR 识别得到的图片。</p>
             <div className="placeholder-box">
                <ImageIcon size={48} color="var(--color-border)" />
                <p>暂无图片数据</p>
             </div>
          </div>
        )}

        {activeTab === 'feedback' && (
          <div className="pc-section">
             <h2 className="pc-section-title font-serif">问题反馈</h2>
             <form className="pc-form">
                <div className="form-group">
                  <label className="form-label">反馈内容</label>
                  <textarea className="form-control" rows={6} placeholder="请详细描述您遇到的问题或建议..."></textarea>
                </div>
                <button type="button" className="btn-primary pc-save-btn">提交反馈</button>
             </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default PersonalCenter;
