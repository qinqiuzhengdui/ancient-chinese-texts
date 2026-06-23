import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginAPI } from '../services/auth';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = useState<'phone' | 'password' | 'email'>('password');
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginMethod !== 'password') {
      alert('抱歉，手机号/邮箱快捷登录正在开发中，请使用密码登录！');
      return;
    }

    setError('');
    try {
      setLoading(true);
      const data = await loginAPI(formData.username, formData.password);
      // Save token
      localStorage.setItem('token', data.access_token);
      alert('登录成功！');
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || '登录失败，请检查账号密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel">
        <h2 className="auth-title">登 录</h2>
        
        {error && <div className="auth-error">{error}</div>}

        <div className="auth-tabs">
          <button 
            type="button"
            className={`auth-tab ${loginMethod === 'phone' ? 'active' : ''}`}
            onClick={() => setLoginMethod('phone')}
          >手机号</button>
          <button 
            type="button"
            className={`auth-tab ${loginMethod === 'password' ? 'active' : ''}`}
            onClick={() => setLoginMethod('password')}
          >密码</button>
          <button 
            type="button"
            className={`auth-tab ${loginMethod === 'email' ? 'active' : ''}`}
            onClick={() => setLoginMethod('email')}
          >邮箱</button>
        </div>

        <form onSubmit={handleLogin} className="auth-form">
          {loginMethod === 'phone' && (
            <>
              <div className="form-group">
                <label className="form-label">手机号</label>
                <input type="tel" className="form-control" placeholder="请输入手机号" required />
              </div>
              <div className="form-group">
                <label className="form-label">验证码</label>
                <div className="input-group">
                  <input type="text" className="form-control" placeholder="请输入验证码" required />
                  <button type="button" className="btn btn-outline">获取</button>
                </div>
              </div>
            </>
          )}

          {loginMethod === 'password' && (
            <>
              <div className="form-group">
                <label className="form-label">用户名 / 邮箱</label>
                <input 
                  type="text" 
                  name="username"
                  className="form-control" 
                  placeholder="请输入用户名或邮箱" 
                  required 
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">密码</label>
                <input 
                  type="password" 
                  name="password"
                  className="form-control" 
                  placeholder="请输入密码" 
                  required 
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          {loginMethod === 'email' && (
            <>
              <div className="form-group">
                <label className="form-label">邮箱</label>
                <input type="email" className="form-control" placeholder="支持qq、edu等邮箱" required />
              </div>
              <div className="form-group">
                <label className="form-label">验证码</label>
                <div className="input-group">
                  <input type="text" className="form-control" placeholder="请输入验证码" required />
                  <button type="button" className="btn btn-outline">获取</button>
                </div>
              </div>
            </>
          )}

          <button type="submit" className="btn-primary auth-submit-btn" disabled={loading}>
            {loading ? '登录中...' : '登 录'}
          </button>
        </form>

        <div className="auth-footer">
          还没有账号？ <Link to="/register" className="auth-link">立即注册</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
