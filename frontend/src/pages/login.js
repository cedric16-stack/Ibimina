import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../utils/api';
import { useAuth } from '../context/authcontext';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'admin' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = isLogin ? await login(form) : await register(form);
      loginUser(res.data.token, res.data.user);
      const role = res.data.user.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'president') navigate('/president');
      else if (role === 'secretary') navigate('/secretary');
      else navigate('/member');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg" />

      {/* Background decoration */}
      <div style={{
        position: 'absolute', width: '600px', height: '600px',
        borderRadius: '50%', border: '1px solid rgba(201,168,76,0.06)',
        top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', width: '400px', height: '400px',
        borderRadius: '50%', border: '1px solid rgba(201,168,76,0.08)',
        top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        pointerEvents: 'none'
      }} />

      <div className="login-card">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: 'var(--gold-dim)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 0 30px rgba(201,168,76,0.15)'
          }}>
            <span style={{ fontSize: '26px' }}>💰</span>
          </div>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: '30px',
            fontWeight: 900, lineHeight: 1,
            background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>IBIMINA</div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '10px',
            color: 'var(--text-dim)', letterSpacing: '3px',
            textTransform: 'uppercase', marginTop: '4px'
          }}>Community Fund Management</div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', background: 'var(--surface2)',
          borderRadius: 'var(--radius-sm)', padding: '4px', marginBottom: '28px'
        }}>
          {['Sign In', 'Register'].map((t, i) => (
            <button key={t} onClick={() => { setIsLogin(i === 0); setError(''); }}
              style={{
                flex: 1, padding: '9px', border: 'none', cursor: 'pointer',
                borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                fontFamily: 'var(--font-body)', transition: 'all 0.2s',
                background: (i === 0) === isLogin ? 'var(--surface)' : 'none',
                color: (i === 0) === isLogin ? 'var(--gold)' : 'var(--text-muted)',
                boxShadow: (i === 0) === isLogin ? 'var(--shadow)' : 'none',
              }}>{t}</button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-error">{error}</div>}

          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" placeholder="Enter your name" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" placeholder="name@example.com"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input className="form-input" type={showPass ? 'text' : 'password'}
                placeholder="••••••••" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} required
                style={{ paddingRight: '44px' }} />
              <button type="button" onClick={() => setShowPass(!showPass)}
                style={{
                  position: 'absolute', right: '14px', top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', color: 'var(--text-dim)', cursor: 'pointer'
                }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Register As</label>
              <select className="form-select" value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="admin">Admin</option>
                <option value="member">Member</option>
              </select>
            </div>
          )}

          <button className="btn btn-primary btn-lg" type="submit"
            disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '16px', height: '16px', border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Processing...
              </span>
            ) : (
              <>
                {isLogin ? 'Sign In' : 'Create Account'}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
          Secure · Encrypted · Rwanda
        </div>
      </div>
    </div>
  );
};

export default LoginPage;