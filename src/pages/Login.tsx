import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginAPI, loginByCodeAPI } from '../services/auth';
import { sendVerifyCode } from '../services/user';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = useState<'phone' | 'password' | 'email'>('password');
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [phone, setPhone] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [email, setEmail] = useState('');
  const [emailCode, setEmailCode] = useState('');
  
  const [phoneCountdown, setPhoneCountdown] = useState(0);
  const [emailCountdown, setEmailCountdown] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    if (!phone) return alert('请先输入手机号');
    try {
      const res = await sendVerifyCode(phone);
      setPhoneCountdown(60);
      console.log(`[Phone Verification Code]`, res.code);
      alert(`验证码已发送！测试验证码为: ${res.code} (已输出至浏览器控制台)`);
    } catch (err: any) {
      alert(err.response?.data?.detail || '发送失败');
    }
  };

  const handleSendEmailCode = async () => {
    if (!email) return alert('请先输入邮箱');
    try {
      const res = await sendVerifyCode(email);
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      setLoading(true);
      let data;
      if (loginMethod === 'password') {
        data = await loginAPI(formData.username, formData.password);
      } else if (loginMethod === 'phone') {
        if (!phone || !phoneCode) {
          setError('请输入手机号和验证码！');
          setLoading(false);
          return;
        }
        data = await loginByCodeAPI('phone', phone, phoneCode);
      } else {
        if (!email || !emailCode) {
          setError('请输入邮箱和验证码！');
          setLoading(false);
          return;
        }
        data = await loginByCodeAPI('email', email, emailCode);
      }
      
      // Save token
      localStorage.setItem('token', data.access_token);
      alert('登录成功！');
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || '登录失败，请检查登录信息');
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
                <input 
                  type="tel" 
                  className="form-control" 
                  placeholder="请输入手机号" 
                  required 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">验证码</label>
                <div className="verify-input-group">
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="请输入验证码" 
                    required 
                    value={phoneCode}
                    onChange={(e) => setPhoneCode(e.target.value)}
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
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="支持qq、edu等邮箱" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">验证码</label>
                <div className="verify-input-group">
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="请输入验证码" 
                    required 
                    value={emailCode}
                    onChange={(e) => setEmailCode(e.target.value)}
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
