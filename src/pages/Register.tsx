import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/login');
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel register-card">
        <h2 className="auth-title">新用户注册</h2>
        
        <form onSubmit={handleRegister} className="auth-form">
          <div className="form-group">
            <label className="form-label">用户名</label>
            <input type="text" className="form-control" placeholder="请输入用户名" required />
          </div>
          
          <div className="form-group">
            <label className="form-label">真实姓名</label>
            <input type="text" className="form-control" placeholder="请输入真实姓名（不公开显示）" required />
          </div>

          <div className="form-group">
            <label className="form-label">手机号</label>
            <input type="tel" className="form-control" placeholder="请输入手机号" required />
          </div>

          <div className="form-group">
            <label className="form-label">手机验证码</label>
            <div className="input-group">
              <input type="text" className="form-control" placeholder="请输入验证码" required />
              <button type="button" className="btn btn-outline">获取</button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">邮箱</label>
            <input type="email" className="form-control" placeholder="请输入邮箱" required />
          </div>

          <div className="form-group">
            <label className="form-label">邮箱验证码</label>
            <div className="input-group">
              <input type="text" className="form-control" placeholder="请输入验证码" required />
              <button type="button" className="btn btn-outline">获取</button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">密码</label>
            <input type="password" className="form-control" placeholder="请输入密码" required />
          </div>

          <div className="form-group">
            <label className="form-label">确认密码</label>
            <input type="password" className="form-control" placeholder="请再次输入密码" required />
          </div>

          <button type="submit" className="btn-primary auth-submit-btn">注 册</button>
        </form>

        <div className="auth-footer">
          已有账号？ <Link to="/login" className="auth-link">直接登录</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
