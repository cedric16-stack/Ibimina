import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Users, TrendingUp, FileText, ChevronDown,
  ArrowRight, Check, Lock, BarChart2, Zap, Globe
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const faqs = [
    { q: 'What is IBIMINA?', a: 'IBIMINA is a digital platform for managing community savings groups (tontines). It replaces paper-based record keeping with a secure, transparent system for contributions, loans, and approvals.' },
    { q: 'Who can use IBIMINA?', a: 'IBIMINA is designed for community savings groups in Rwanda. An admin creates the fund, assigns a president, who then manages members, secretaries, contributions and loan requests.' },
    { q: 'How does the loan approval process work?', a: 'A member submits a loan request. The secretary reviews and approves it first, then it goes to the president for final approval. This two-step process ensures accountability.' },
    { q: 'Is my data secure?', a: 'Yes. All data is encrypted, passwords are hashed with bcrypt, and access is role-based — each user only sees what they\'re authorized to see.' },
    { q: 'How do I get started?', a: 'Click "Get Started" to submit your fund details. Our admin will review your request, create your fund, and send you a setup link to activate your account.' },
    { q: 'What currencies are supported?', a: 'IBIMINA currently supports Rwandan Franc (RWF) as the primary currency for all transactions and reports.' },
  ];

  const roles = [
    {
      role: 'Admin',
      icon: '🛡️',
      color: 'var(--gold)',
      bg: 'var(--gold-dim)',
      desc: 'Platform administrator with full oversight',
      powers: ['Create and manage funds', 'Assign presidents', 'View all transactions', 'Monitor platform health']
    },
    {
      role: 'President',
      icon: '👑',
      color: '#3498DB',
      bg: 'rgba(52,152,219,0.12)',
      desc: 'Fund leader with management authority',
      powers: ['Add members & secretary', 'Set loan terms & interest rates', 'Approve or reject loan requests', 'Manage fund description & terms']
    },
    {
      role: 'Secretary',
      icon: '📋',
      color: '#2ECC71',
      bg: 'rgba(46,204,113,0.12)',
      desc: 'Records officer and first approver',
      powers: ['Record member payments', 'First-stage loan approval', 'Generate contribution reports', 'Generate loan reports per member']
    },
    {
      role: 'Member',
      icon: '👤',
      color: '#E67E22',
      bg: 'rgba(230,126,34,0.12)',
      desc: 'Fund participant and beneficiary',
      powers: ['Make contributions', 'Request loans', 'View personal history', 'Track savings & loan status']
    }
  ];

  const workflow = [
    { step: '01', title: 'Admin Creates Fund', desc: 'Admin sets up a new community fund and assigns a president with a secure setup link.' },
    { step: '02', title: 'President Configures', desc: 'President activates their account, sets loan terms, interest rates, and adds members.' },
    { step: '03', title: 'Members Contribute', desc: 'Members make contributions via MTN Mobile Money, BK Bank, or Equity Bank.' },
    { step: '04', title: 'Loans & Approvals', desc: 'Members request loans. Secretary approves first, then president gives final approval.' },
    { step: '05', title: 'Reports & Transparency', desc: 'Secretary generates per-member contribution and loan reports. Full audit trail maintained.' },
  ];

  return (
    <div style={{ background: 'var(--obsidian)', color: 'var(--text)', minHeight: '100vh', fontFamily: 'var(--font-body)' }}>

      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 40px', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'rgba(10,11,14,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        transition: 'all 0.3s ease'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'var(--gold-dim)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px'
          }}>💰</div>
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 900,
            background: 'linear-gradient(135deg, var(--gold), var(--gold-light))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>IBIMINA</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          {['workflows', 'roles', 'security', 'faqs'].map(id => (
            <button key={id} onClick={() => scrollTo(id)} style={{
              background: 'none', border: 'none', color: 'var(--text-muted)',
              fontSize: '13px', fontWeight: 500, cursor: 'pointer', textTransform: 'capitalize',
              fontFamily: 'var(--font-body)', transition: 'color 0.2s'
            }}
              onMouseEnter={e => e.target.style.color = 'var(--gold)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
            >{id}</button>
          ))}
          <button onClick={() => navigate('/login')} style={{
            background: 'linear-gradient(135deg, var(--gold), var(--gold-light))',
            border: 'none', borderRadius: '8px', padding: '8px 20px',
            fontSize: '13px', fontWeight: 700, color: '#0A0B0E', cursor: 'pointer',
            fontFamily: 'var(--font-body)'
          }}>Login</button>
        </div>
      </nav>

      {/* HERO */}
      <section ref={heroRef} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: '80px 40px 40px' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(201,168,76,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: '800px', height: '800px', borderRadius: '50%', border: '1px solid rgba(201,168,76,0.05)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', border: '1px solid rgba(201,168,76,0.08)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />

        <div style={{ textAlign: 'center', maxWidth: '780px', position: 'relative', zIndex: 1, animation: 'fadeUp 0.7s ease' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 16px', borderRadius: '100px',
            background: 'var(--gold-dim)', border: '1px solid var(--border)',
            fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--gold)',
            letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '32px'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--gold)', display: 'inline-block' }} />
            Community Fund Management · Rwanda
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(42px, 7vw, 80px)',
            fontWeight: 900, lineHeight: 1.05, marginBottom: '24px',
            background: 'linear-gradient(135deg, var(--text) 0%, var(--gold-light) 60%, var(--gold) 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            Your Community.<br />Your Savings.<br />Secured.
          </h1>

          <p style={{ fontSize: '18px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '40px', maxWidth: '560px', margin: '0 auto 40px' }}>
            IBIMINA digitizes community savings groups with transparent contribution tracking, structured loan approvals, and role-based access — built for Rwanda.
          </p>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/get-started')} style={{
              background: 'linear-gradient(135deg, var(--gold), var(--gold-light))',
              border: 'none', borderRadius: '12px', padding: '16px 32px',
              fontSize: '15px', fontWeight: 700, color: '#0A0B0E', cursor: 'pointer',
              fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: '8px',
              boxShadow: '0 8px 32px rgba(201,168,76,0.25)'
            }}>
              Get Started <ArrowRight size={16} />
            </button>
            <button onClick={() => navigate('/login')} style={{
              background: 'none', border: '1px solid var(--border)', borderRadius: '12px',
              padding: '16px 32px', fontSize: '15px', fontWeight: 600,
              color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font-body)',
              transition: 'all 0.2s'
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              Sign In
            </button>
          </div>

          <div style={{ marginTop: '80px', display: 'flex', justifyContent: 'center', gap: '48px', flexWrap: 'wrap' }}>
            {[
              { label: 'Funds Managed', value: '100+' },
              { label: 'Members Served', value: '2,400+' },
              { label: 'Transactions', value: '18,000+' },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 900, color: 'var(--gold)' }}>{stat.value}</div>
                <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)', cursor: 'pointer', animation: 'fadeIn 1s ease 0.5s both' }} onClick={() => scrollTo('workflows')}>
          <ChevronDown size={24} color='var(--text-dim)' style={{ animation: 'pulse-gold 2s infinite' }} />
        </div>
      </section>

      {/* WORKFLOWS */}
      <section id="workflows" style={{ padding: '100px 40px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--gold)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '16px' }}>How It Works</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 700 }}>From Setup to Savings</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginTop: '12px', maxWidth: '500px', margin: '12px auto 0' }}>A structured workflow that keeps every community fund transparent and accountable.</p>
        </div>

        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: '28px', top: '24px', bottom: '24px', width: '1px', background: 'linear-gradient(180deg, var(--gold) 0%, transparent 100%)', opacity: 0.3 }} />
          <div style={{ display: 'grid', gap: '24px' }}>
            {workflow.map((w, i) => (
              <div key={i} style={{
                display: 'flex', gap: '32px', alignItems: 'flex-start',
                padding: '28px 32px', background: 'var(--surface)',
                border: '1px solid var(--border-soft)', borderRadius: 'var(--radius)',
                transition: 'all 0.2s', cursor: 'default'
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-soft)'; e.currentTarget.style.transform = 'translateX(0)'; }}
              >
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--gold)',
                  background: 'var(--gold-dim)', border: '1px solid var(--border)',
                  borderRadius: '8px', padding: '6px 12px', flexShrink: 0, letterSpacing: '1px'
                }}>{w.step}</div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>{w.title}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>{w.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section id="roles" style={{ padding: '100px 40px', background: 'var(--dark)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--gold)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '16px' }}>Access Levels</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 700 }}>Built for Every Role</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginTop: '12px' }}>Each participant has a tailored experience with the right level of access.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {roles.map((r, i) => (
              <div key={i} style={{
                background: 'var(--surface)', border: '1px solid var(--border-soft)',
                borderRadius: 'var(--radius)', padding: '28px 24px',
                transition: 'all 0.2s'
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = r.color; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 40px ${r.bg}`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-soft)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>{r.icon}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: r.color, marginBottom: '6px' }}>{r.role}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.5 }}>{r.desc}</div>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {r.powers.map((p, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                      <Check size={13} color={r.color} />
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECURITY */}
      <section id="security" style={{ padding: '100px 40px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--gold)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '16px' }}>Trust & Safety</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 700 }}>Security First</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginTop: '12px' }}>Your community's money deserves the highest level of protection.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {[
            { icon: <Lock size={24} />, title: 'Encrypted Passwords', desc: 'All passwords are hashed with bcrypt — never stored in plain text. Even admins cannot see member passwords.' },
            { icon: <Shield size={24} />, title: 'Role-Based Access', desc: 'Each user sees only what they\'re authorized to. Members cannot access president features and vice versa.' },
            { icon: <FileText size={24} />, title: 'Full Audit Trail', desc: 'Every action — contributions, approvals, rejections — is logged with timestamps and user attribution.' },
            { icon: <Users size={24} />, title: 'Two-Step Approvals', desc: 'Loan requests require both secretary and president approval, preventing unauthorized disbursements.' },
            { icon: <BarChart2 size={24} />, title: 'Transparent Records', desc: 'All transactions are visible to authorized roles, ensuring complete financial transparency within each fund.' },
            { icon: <Zap size={24} />, title: 'JWT Authentication', desc: 'Secure token-based authentication with 30-day expiry ensures sessions are always valid and protected.' },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', gap: '16px', padding: '24px',
              background: 'var(--surface)', border: '1px solid var(--border-soft)',
              borderRadius: 'var(--radius)', transition: 'all 0.2s'
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-soft)'; }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--gold-dim)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', flexShrink: 0 }}>
                {item.icon}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '6px' }}>{item.title}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section id="faqs" style={{ padding: '100px 40px', background: 'var(--dark)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--gold)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '16px' }}>FAQ</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 700 }}>Common Questions</h2>
          </div>

          <div style={{ display: 'grid', gap: '12px' }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{
                background: 'var(--surface)', border: `1px solid ${openFaq === i ? 'var(--border)' : 'var(--border-soft)'}`,
                borderRadius: 'var(--radius)', overflow: 'hidden', transition: 'border-color 0.2s'
              }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '20px 24px', background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-body)', fontSize: '15px', fontWeight: 600,
                  color: openFaq === i ? 'var(--gold)' : 'var(--text)', textAlign: 'left', gap: '16px'
                }}>
                  {faq.q}
                  <ChevronDown size={18} color={openFaq === i ? 'var(--gold)' : 'var(--text-dim)'}
                    style={{ flexShrink: 0, transform: openFaq === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 24px 20px', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7, animation: 'fadeIn 0.2s ease' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '100px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 80% at 50% 100%, rgba(201,168,76,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--gold)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '24px' }}>Ready to Begin</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 900, marginBottom: '20px', lineHeight: 1.1 }}>
            Start Managing<br />Your Fund Today
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginBottom: '40px', maxWidth: '460px', margin: '0 auto 40px' }}>
            Submit your fund details and our admin will set everything up. You'll receive a secure link to activate your president account.
          </p>
          <button onClick={() => navigate('/get-started')} style={{
            background: 'linear-gradient(135deg, var(--gold), var(--gold-light))',
            border: 'none', borderRadius: '14px', padding: '18px 40px',
            fontSize: '16px', fontWeight: 700, color: '#0A0B0E', cursor: 'pointer',
            fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: '10px',
            boxShadow: '0 12px 40px rgba(201,168,76,0.3)', animation: 'pulse-gold 3s infinite'
          }}>
            Get Started <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '32px 40px', borderTop: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 900, background: 'linear-gradient(135deg, var(--gold), var(--gold-light))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>IBIMINA</span>
          <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>· Community Fund Management</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
          <Globe size={12} /> Made in Rwanda · {new Date().getFullYear()}
        </div>
        <div style={{ display: 'flex', gap: '24px' }}>
          <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', fontSize: '13px', color: 'var(--text-dim)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Login</button>
          <button onClick={() => navigate('/get-started')} style={{ background: 'none', border: 'none', fontSize: '13px', color: 'var(--gold)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Get Started</button>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;