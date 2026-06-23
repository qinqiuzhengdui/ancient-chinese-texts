import { useState, useEffect } from 'react';
import { User, Bookmark, Edit3, Image as ImageIcon, MessageCircle, Clock } from 'lucide-react';
import { getUserProfile, updateUserProfile, sendVerifyCode, type UserProfile } from '../services/user';
import { getMyNotes, type NoteResponse } from '../services/notes';
import './PersonalCenter.css';

const PersonalCenter = () => {
  const [activeTab, setActiveTab] = useState('info');
  const [formData, setFormData] = useState<UserProfile & { phone_code?: string, email_code?: string }>({});
  
  const [phoneCountdown, setPhoneCountdown] = useState(0);
  const [emailCountdown, setEmailCountdown] = useState(0);
  
  const [notes, setNotes] = useState<NoteResponse[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  
  useEffect(() => {
    // Fetch initial profile
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile();
        // Format date to YYYY-MM-DD if it exists
        if (data.birth_date) {
          data.birth_date = data.birth_date.split('T')[0];
        }
        setFormData(data);
      } catch (err) {
        console.error("Failed to load profile", err);
      }
    };
    fetchProfile();
  }, []);

  // Handle countdowns
  useEffect(() => {
    if (phoneCountdown > 0) {
      const timer = setTimeout(() => setPhoneCountdown(phoneCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [phoneCountdown]);

  useEffect(() => {
    if (emailCountdown > 0) {
      const timer = setTimeout(() => setEmailCountdown(emailCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [emailCountdown]);

  // Fetch Notes when active tab becomes 'notes'
  useEffect(() => {
    if (activeTab === 'notes') {
      const fetchNotes = async () => {
        setLoadingNotes(true);
        try {
          const data = await getMyNotes();
          setNotes(data);
        } catch (err) {
          console.error("Failed to load notes", err);
        } finally {
          setLoadingNotes(false);
        }
      };
      fetchNotes();
    }
  }, [activeTab]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSendCode = async (type: 'phone' | 'email') => {
    const target = type === 'phone' ? formData.phone : formData.email;
    if (!target) {
      alert(`请先填写${type === 'phone' ? '手机号码' : '邮箱'}`);
      return;
    }
    try {
      await sendVerifyCode(target);
      if (type === 'phone') setPhoneCountdown(60);
      if (type === 'email') setEmailCountdown(60);
      alert('验证码已发送！(请在后端控制台查看模拟的验证码)');
    } catch (err: any) {
      alert(err.response?.data?.detail || '发送验证码失败');
    }
  };

  const handleSave = async () => {
    try {
      await updateUserProfile(formData);
      alert('修改成功！');
      // Clear codes after success
      setFormData(prev => ({ ...prev, phone_code: '', email_code: '' }));
    } catch (err: any) {
      alert(err.response?.data?.detail || '保存失败，请检查验证码是否正确');
    }
  };

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
          <h3 className="pc-username">{formData.real_name || formData.username || '未命名用户'}</h3>
          <p className="pc-role">{formData.title || '普通用户'}</p>
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
                  <input type="text" name="username" value={formData.username || ''} onChange={handleInputChange} className="form-control" />
                </div>
                <div className="form-group">
                  <label className="form-label">用户姓名</label>
                  <input type="text" name="real_name" value={formData.real_name || ''} onChange={handleInputChange} className="form-control" placeholder="您的真实姓名" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">出生日期</label>
                  <input type="date" name="birth_date" value={formData.birth_date || ''} onChange={handleInputChange} className="form-control" />
                </div>
                <div className="form-group">
                  <label className="form-label">性别</label>
                  <select name="gender" value={formData.gender || ''} onChange={handleInputChange} className="form-control">
                    <option value="">请选择</option>
                    <option value="男">男</option>
                    <option value="女">女</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">手机号码</label>
                  <input type="tel" name="phone" value={formData.phone || ''} onChange={handleInputChange} className="form-control" />
                </div>
                <div className="form-group">
                  <label className="form-label">用户邮箱</label>
                  <input type="email" name="email" value={formData.email || ''} onChange={handleInputChange} className="form-control" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">手机验证码</label>
                  <div className="verify-code-wrapper">
                    <input type="text" name="phone_code" value={formData.phone_code || ''} onChange={handleInputChange} className="form-control" placeholder="请输入短信验证码" />
                    <button type="button" className="verify-btn" disabled={phoneCountdown > 0} onClick={() => handleSendCode('phone')}>
                      {phoneCountdown > 0 ? `已发送(${phoneCountdown}s)` : '获取验证码'}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">邮箱验证码</label>
                  <div className="verify-code-wrapper">
                    <input type="text" name="email_code" value={formData.email_code || ''} onChange={handleInputChange} className="form-control" placeholder="请输入邮箱验证码" />
                    <button type="button" className="verify-btn" disabled={emailCountdown > 0} onClick={() => handleSendCode('email')}>
                      {emailCountdown > 0 ? `已发送(${emailCountdown}s)` : '获取验证码'}
                    </button>
                  </div>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">学历</label>
                  <input type="text" name="education" value={formData.education || ''} onChange={handleInputChange} className="form-control" placeholder="如：博士" />
                </div>
                <div className="form-group">
                  <label className="form-label">职称</label>
                  <input type="text" name="title" value={formData.title || ''} onChange={handleInputChange} className="form-control" placeholder="如：研究员" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">邮政地址</label>
                <input type="text" name="address" value={formData.address || ''} onChange={handleInputChange} className="form-control" placeholder="请输入详细地址" />
              </div>
              <div className="form-group">
                <label className="form-label">邮政编码</label>
                <input type="text" name="postal_code" value={formData.postal_code || ''} onChange={handleInputChange} className="form-control" placeholder="请输入邮政编码" />
              </div>
              
              <button type="button" className="btn-primary pc-save-btn" onClick={handleSave}>保存修改</button>
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
          <div className="pc-tab-pane slide-up">
            <h2 className="pc-section-title font-serif">我的笔记</h2>
            {loadingNotes ? (
              <p>加载中...</p>
            ) : notes.length === 0 ? (
              <div className="empty-state">
                <Bookmark size={48} color="var(--color-border)" />
                <p>这里将展示您在 AI 助手 Notebook 中保存的所有研究随笔</p>
                <p style={{fontSize: '0.9rem', color: 'var(--color-gray)', marginTop: '8px'}}>快去 AI 助手页面记录您的第一条灵感吧！</p>
              </div>
            ) : (
              <div className="notes-list">
                {notes.map(note => (
                  <div key={note.id} className="note-card">
                    <div className="note-header">
                      <Clock size={14} className="note-icon" />
                      <span className="note-date">{new Date(note.created_at).toLocaleString()}</span>
                    </div>
                    <div className="note-content">
                      <p>{note.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
