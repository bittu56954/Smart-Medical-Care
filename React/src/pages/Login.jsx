import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Pill, Mail, Lock, LogIn, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import Footer from '../components/common/Footer';
import bittuKumarImg from '../assets/bittu_kumar.jpg';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const validateEmail = (emailStr) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(emailStr).toLowerCase());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password', 'error');
      return;
    }

    if (!validateEmail(email)) {
      showToast('Please enter a valid email address (e.g., user@example.com).', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await loginUser(email, password);
      if (res?.requiresVerification || res?.requireOtp) {
        showToast(res.message || 'Please verify your email with the OTP sent to your inbox.', 'info');
        navigate('/verify-otp', { state: { email, message: res.message, otpDebug: res.otpDebug } });
      } else if (res?.success) {
        showToast('Login successful! Welcome back.', 'success');
        if (res.user?.role === 'admin' && res.user?.email?.toLowerCase() === 'admin@gmail.com') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        showToast(res?.message || 'Login failed. Please check your credentials.', 'error');
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)', color: 'var(--text-main)' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
        <div style={{ width: '100%', maxWidth: '440px', background: 'var(--bg-surface)', borderRadius: '24px', padding: '2rem 1.5rem', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-light)' }}>
          

          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ width: 58, height: 58, borderRadius: '18px', overflow: 'hidden', border: '2px solid #0d9488', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', boxShadow: '0 6px 20px rgba(2, 132, 199, 0.3)', background: '#0f172a' }}>
              <img src={bittuKumarImg} alt="Smart Medical Care Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Sign In to Smart Medical Care</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '0.35rem' }}>Access your scanned medicines and expiry alerts</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  placeholder="Enter Your Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ width: '100%', paddingLeft: '2.6rem' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-muted)' }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: '0.82rem', color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>
                  Forgot Password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter Your Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ width: '100%', paddingLeft: '2.6rem', paddingRight: '2.6rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px'
                  }}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.85rem',
                background: 'linear-gradient(135deg, #0284c7, #0d9488)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: loading ? 'wait' : 'pointer',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '1.5rem'
              }}
            >
              {loading ? (
                <>
                  <span className="spinner"></span> Logging in...
                </>
              ) : (
                <>
                  <LogIn size={18} /> Sign In <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>



          <div style={{ marginTop: '1.5rem', textAlign: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
              Don't have an account yet?{' '}
              <Link to="/register" style={{ color: '#0284c7', fontWeight: 700, textDecoration: 'none' }}>
                Create Free Account
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
