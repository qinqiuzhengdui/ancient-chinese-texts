import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = useState<'phone' | 'password' | 'email'>('phone');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/');
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel">
        <h2 className="auth-title">登 录</h2>
        
        <div className="auth-tabs">
          <button 
            className={`auth-tab ${loginMethod === 'phone' ? 'active' : ''}`}
            onClick={() => setLoginMethod('phone')}
          >手机号</button>
          <button 
            className={`auth-tab ${loginMethod === 'password' ? 'active' : ''}`}
            onClick={() => setLoginMethod('password')}
          >密码</button>
          <button 
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
                <label className="form-label">用户名</label>
                <input type="text" className="form-control" placeholder="请输入用户名" required />
              </div>
              <div className="form-group">
                <label className="form-label">密码</label>
                <input type="password" className="form-control" placeholder="请输入密码" required />
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

          <button type="submit" className="btn-primary auth-submit-btn">登 录</button>
        </form>

        <div className="auth-footer">
          还没有账号？ <Link to="/register" className="auth-link">立即注册</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
