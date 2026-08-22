import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, Mail, Lock, Phone, UserPlus, ShieldCheck, Shield, Eye, EyeOff, ArrowRight } from 'lucide-react';
import Footer from '../components/common/Footer';
import bittuKumarImg from '../assets/bittu_kumar.jpg';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'user'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { registerUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateEmail = (emailStr) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(emailStr).toLowerCase());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword, phone, role } = formData;

    if (!name || !email || !password || !phone) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    if (!validateEmail(email)) {
      showToast('Please enter a valid email address (e.g., user@example.com).', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters long.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    setLoading(true);
    const result = await registerUser(name, email, password, role, phone);
    setLoading(false);

    if (result?.success) {
      showToast(result.message || 'Registration successful! Verification OTP sent to your email.', 'success');
      navigate('/verify-otp', { state: { email, message: result.message, otpDebug: result.otpDebug } });
    } else {
      showToast(result?.message || 'Registration failed. Try again.', 'error');
    }
  };

  return (
    <div className="page-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)', color: 'var(--text-main)' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
        <div style={{ width: '100%', maxWidth: '480px', background: 'var(--bg-surface)', borderRadius: '24px', padding: '2rem 1.5rem', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-light)' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ width: 58, height: 58, borderRadius: '18px', overflow: 'hidden', border: '2px solid #0d9488', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', boxShadow: '0 6px 20px rgba(2, 132, 199, 0.3)', background: '#0f172a' }}>
              <img src={bittuKumarImg} alt="Smart Medical Care Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Create Smart Medical Care Account</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '0.35rem' }}>Start scanning & managing medicine safety digitally</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.15rem' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter Your Name :"
                  required
                  style={{ width: '100%', paddingLeft: '2.6rem' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.15rem' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter Your Email"
                  required
                  style={{ width: '100%', paddingLeft: '2.6rem' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.15rem' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Phone Number
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter Your Phone Number"
                  required
                  style={{ width: '100%', paddingLeft: '2.6rem' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.15rem' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Password (min 6 chars)
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter Your Password"
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

            <div style={{ marginBottom: '1.15rem' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Enter Your Confirm Password"
                  required
                  style={{ width: '100%', paddingLeft: '2.6rem', paddingRight: '2.6rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                  title={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '0.85rem', background: 'linear-gradient(135deg, #0284c7, #0d9488)', color: '#ffffff', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '1rem', cursor: loading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)' }}
            >
              {loading ? (
                <>
                  <span className="spinner"></span> Creating Account...
                </>
              ) : (
                <><UserPlus size={18} /> Register & Send OTP</>
              )}
            </button>
          </form>

          <div style={{ marginTop: '1.75rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#0284c7', fontWeight: 700, textDecoration: 'none' }}>
              Sign In <ArrowRight size={14} style={{ verticalAlign: 'middle' }} />
            </Link>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Register;
