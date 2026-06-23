import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerAPI } from '../services/auth';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致！');
      return;
    }

    try {
      setLoading(true);
      await registerAPI(formData.username, formData.email, formData.password);
      alert('注册成功，请前往登录！');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.detail || '注册失败，请检查网络或稍后再试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel register-card">
        <h2 className="auth-title">新用户注册</h2>
        
        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleRegister} className="auth-form">
          <div className="form-group">
            <label className="form-label">用户名</label>
            <input 
              type="text" 
              name="username"
              className="form-control" 
              placeholder="请输入英文字母或数字" 
              required 
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">邮箱</label>
            <input 
              type="email" 
              name="email"
              className="form-control" 
              placeholder="请输入真实邮箱" 
              required 
              value={formData.email}
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

          <div className="form-group">
            <label className="form-label">确认密码</label>
            <input 
              type="password" 
              name="confirmPassword"
              className="form-control" 
              placeholder="请再次输入密码" 
              required 
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn-primary auth-submit-btn" disabled={loading}>
            {loading ? '注册中...' : '注 册'}
          </button>
        </form>

        <div className="auth-footer">
          已有账号？ <Link to="/login" className="auth-link">直接登录</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
