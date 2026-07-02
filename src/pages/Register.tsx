import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerAPI } from '../services/auth';
import { sendVerifyCode } from '../services/user';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    phoneCode: '',
    email: '',
    emailCode: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [phoneCountdown, setPhoneCountdown] = useState(0);
  const [emailCountdown, setEmailCountdown] = useState(0);

  React.useEffect(() => {
    if (phoneCountdown > 0) {
      const timer = setTimeout(() => setPhoneCountdown(phoneCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [phoneCountdown]);

  React.useEffect(() => {
    if (emailCountdown > 0) {
      const timer = setTimeout(() => setEmailCountdown(emailCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [emailCountdown]);

  const handleSendPhoneCode = async () => {
    if (!formData.phone) return alert('请先输入手机号');
    try {
      const res = await sendVerifyCode(formData.phone);
      setPhoneCountdown(60);
      console.log(`[Phone Verification Code]`, res.code);
      alert(`验证码已发送！测试验证码为: ${res.code} (已输出至浏览器控制台)`);
    } catch (err: any) {
      alert(err.response?.data?.detail || '发送失败');
    }
  };

  const handleSendEmailCode = async () => {
    if (!formData.email) return alert('请先输入邮箱');
    try {
      const res = await sendVerifyCode(formData.email);
      setEmailCountdown(60);
      console.log(`[Email Verification Code]`, res.code);
      alert(`验证码已发送！测试验证码为: ${res.code} (已输出至浏览器控制台)`);
    } catch (err: any) {
      alert(err.response?.data?.detail || '发送失败');
    }
  };

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
      await registerAPI(
        formData.username, 
        formData.email, 
        formData.emailCode, 
        formData.phone, 
        formData.phoneCode, 
        formData.password
      );
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
            <label className="form-label">手机号</label>
            <input 
              type="text" 
              name="phone"
              className="form-control" 
              placeholder="请输入手机号" 
              required 
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">手机验证码</label>
            <div className="verify-input-group">
              <input 
                type="text" 
                name="phoneCode"
                className="form-control" 
                placeholder="6位验证码" 
                required 
                value={formData.phoneCode}
                onChange={handleChange}
              />
              <button 
                type="button" 
                className="btn-secondary verify-btn" 
                onClick={handleSendPhoneCode}
                disabled={phoneCountdown > 0}
              >
                {phoneCountdown > 0 ? `${phoneCountdown}s 后重发` : '获取验证码'}
              </button>
            </div>
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
            <label className="form-label">邮箱验证码</label>
            <div className="verify-input-group">
              <input 
                type="text" 
                name="emailCode"
                className="form-control" 
                placeholder="6位验证码" 
                required 
                value={formData.emailCode}
                onChange={handleChange}
              />
              <button 
                type="button" 
                className="btn-secondary verify-btn" 
                onClick={handleSendEmailCode}
                disabled={emailCountdown > 0}
              >
                {emailCountdown > 0 ? `${emailCountdown}s 后重发` : '获取验证码'}
              </button>
            </div>
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
