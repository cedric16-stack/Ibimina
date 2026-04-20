import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import API from '../utils/api';

const businessTypes = [
  'Savings Group (Tontine)',
  'Cooperative Society',
  'Church/Faith Group',
  'Women\'s Group',
  'Youth Group',
  'Farmers Group',
  'Market Traders',
  'Other',
];

const GetStarted = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fundName: '', email: '', phone: '', businessType: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.fundName || !form.email || !form.phone || !form.businessType) {
      setError('All fields are required.');
      return;
    }
    setLoading(true);
    try {
      await API.post('/auth/fund-request', form);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    }
    setLoading(false);
  };

  if (success) return (
    <div style={{ minHeight: '100vh', background: 'var(--obsidian)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ textAlign: 'center', maxWidth: '480px' }}>
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          background: 'rgba(46,204,113,0.12)', border: '1px solid rgba(46,204,113,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px', color: '#2ECC71'
        }}>
          <Check size={32} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 700, marginBottom: '12px' }}>Request Submitted!</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.7, marginBottom: '32px' }}>
          Your fund request for <strong style={{ color: 'var(--gold)' }}>{form.fundName}</strong> has been received. Our admin will review it and contact you at <strong style={{ color: 'var(--text)' }}>{form.email}</strong> with your setup link.
        </p>
        <button onClick={() => navigate('/')} style={{
          background: 'linear-gradient(135deg, var(--gold), var(--gold-light))',
          border: 'none', borderRadius: '10px', padding: '12px 28px',
          fontSize: '14px', fontWeight: 700, color: '#0A0B0E', cursor: 'pointer',
          fontFamily: 'var(--font-body)'
        }}>Back to Home</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--obsidian)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(201,168,76,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', border: '1px solid rgba(201,168,76,0.06)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '500px', position: 'relative', zIndex: 1 }}>
        <button onClick={() => navigate('/')} style={{
          background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px',
          fontFamily: 'var(--font-body)', marginBottom: '24px', padding: 0
        }}>
          <ArrowLeft size={14} /> Back to Home
        </button>

        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: '24px', padding: '44px 40px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4), 0 0 30px rgba(201,168,76,0.08)',
          animation: 'fadeUp 0.5s ease'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--gold-dim)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '26px' }}>🏦</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 900, background: 'linear-gradient(135deg, var(--gold), var(--gold-light))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Get Started</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '3px', textTransform: 'uppercase', marginTop: '4px' }}>Register Your Fund</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', marginBottom: '24px', padding: '12px 16px', background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-soft)' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--gold)', flexShrink: 0 }} />
            Submit your details — admin will review and send your setup link
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ background: 'rgba(231,76,60,0.12)', color: '#E74C3C', border: '1px solid rgba(231,76,60,0.2)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', fontSize: '13px', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>Fund Name *</label>
              <input style={{
                width: '100%', background: 'var(--surface2)', border: '1px solid var(--border-soft)',
                borderRadius: 'var(--radius-sm)', padding: '12px 16px', fontSize: '14px',
                color: 'var(--text)', fontFamily: 'var(--font-body)', outline: 'none',
                boxSizing: 'border-box', transition: 'border-color 0.2s'
              }}
                placeholder="e.g. Kigali Savings Circle"
                value={form.fundName}
                onChange={e => setForm({ ...form, fundName: e.target.value })}
                onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-soft)'}
                required />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>Email Address *</label>
              <input style={{
                width: '100%', background: 'var(--surface2)', border: '1px solid var(--border-soft)',
                borderRadius: 'var(--radius-sm)', padding: '12px 16px', fontSize: '14px',
                color: 'var(--text)', fontFamily: 'var(--font-body)', outline: 'none',
                boxSizing: 'border-box', transition: 'border-color 0.2s'
              }}
                type="email" placeholder="president@email.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-soft)'}
                required />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>Phone Number *</label>
              <input style={{
                width: '100%', background: 'var(--surface2)', border: '1px solid var(--border-soft)',
                borderRadius: 'var(--radius-sm)', padding: '12px 16px', fontSize: '14px',
                color: 'var(--text)', fontFamily: 'var(--font-body)', outline: 'none',
                boxSizing: 'border-box', transition: 'border-color 0.2s'
              }}
                placeholder="+250 7XX XXX XXX"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-soft)'}
                required />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>Business / Group Type *</label>
              <select style={{
                width: '100%', background: 'var(--surface2)', border: '1px solid var(--border-soft)',
                borderRadius: 'var(--radius-sm)', padding: '12px 16px', fontSize: '14px',
                color: form.businessType ? 'var(--text)' : 'var(--text-dim)',
                fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box',
                transition: 'border-color 0.2s', cursor: 'pointer'
              }}
                value={form.businessType}
                onChange={e => setForm({ ...form, businessType: e.target.value })}
                onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-soft)'}
                required>
                <option value="">— Select group type —</option>
                {businessTypes.map(t => <option key={t} value={t} style={{ background: 'var(--surface2)' }}>{t}</option>)}
              </select>
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '14px 28px', borderRadius: 'var(--radius-sm)', fontSize: '14px', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer', border: 'none',
              fontFamily: 'var(--font-body)', opacity: loading ? 0.6 : 1,
              background: 'linear-gradient(135deg, var(--gold), var(--gold-light))',
              color: '#0A0B0E', transition: 'all 0.2s'
            }}>
              {loading ? 'Submitting...' : <> Submit Request <ArrowRight size={16} /></>}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
            Already have an account? <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>Login here</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetStarted;