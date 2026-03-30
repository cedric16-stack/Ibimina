import React from 'react';
import { X } from 'lucide-react';

export const Modal = ({ title, subtitle, onClose, children, actions }) => (
  <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
    <div className="modal">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '4px' }}>
        <div className="modal-title">{title}</div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', marginTop: '-2px' }}>
          <X size={20} />
        </button>
      </div>
      {subtitle && <div className="modal-sub">{subtitle}</div>}
      {children}
      {actions && <div className="modal-actions">{actions}</div>}
    </div>
  </div>
);

export const ActivityFeed = ({ activities = [], loading }) => {
  if (loading) return (
    <div style={{ padding: '30px', textAlign: 'center' }}>
      <div className="spinner" style={{ margin: '0 auto' }} />
    </div>
  );

  if (!activities || activities.length === 0) return (
    <div className="empty-state">
      <div className="empty-icon">📋</div>
      <div className="empty-title">No activities yet</div>
      <div className="empty-sub">Actions will appear here</div>
    </div>
  );

  return (
    <div>
      {activities.map((a, i) => (
        <div className="activity-item" key={a._id || i}>
          <div className="activity-dot" style={{
            background: a.type === 'transaction' ? 'var(--green)' :
              a.type === 'member' ? 'var(--blue)' : 'var(--gold)'
          }} />
          <div>
            <div className="activity-text">{a.action}</div>
            {a.details && <div style={{ fontSize: '12px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>{a.details}</div>}
            <div className="activity-time">{new Date(a.createdAt).toLocaleString()}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const StatCard = ({ label, value, icon, color = 'gold', sub }) => (
  <div className="stat-card">
    <div className={`stat-icon ${color}`}>{icon}</div>
    <div className="stat-info">
      <div className="stat-label">{label}</div>
      <div className={`stat-value ${color}`}>{value}</div>
      {sub && <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>{sub}</div>}
    </div>
  </div>
);

export const Alert = ({ type = 'error', children }) => (
  <div className={`alert alert-${type}`}>{children}</div>
);

export const FundHeader = ({ name, balance, currency = 'RWF', description }) => (
  <div className="fund-header">
    <div>
      <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '6px' }}>
        Current Fund
      </div>
      <div className="fund-header-name">{name}</div>
      {description && (
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px', maxWidth: '500px', lineHeight: 1.5 }}>
          {description}
        </div>
      )}
    </div>
    <div className="fund-header-balance">
      <div className="fund-balance-label">Total Balance</div>
      <div className="fund-balance-amount">
        {Number(balance || 0).toLocaleString()} <span style={{ fontSize: '16px', fontFamily: 'var(--font-mono)' }}>{currency}</span>
      </div>
    </div>
  </div>
);

export const PaymentMethodSelector = ({ selected, onChange }) => {
  const methods = [
    { id: 'MTN Mobile Money', name: 'MTN MoMo', type: 'Mobile Money', emoji: '📱' },
    { id: 'BK Bank', name: 'Bank of Kigali', type: 'Bank Transfer', emoji: '🏦' },
    { id: 'Equity Bank', name: 'Equity Bank', type: 'Bank Transfer', emoji: '🏦' },
    { id: 'Cash', name: 'Cash', type: 'Physical', emoji: '💵' },
  ];

  return (
    <div className="payment-methods">
      {methods.map(m => (
        <div
          key={m.id}
          className={`payment-method ${selected === m.id ? 'selected' : ''}`}
          onClick={() => onChange(m.id)}
        >
          <div style={{ fontSize: '22px' }}>{m.emoji}</div>
          <div className="payment-method-name">{m.name}</div>
          <div className="payment-method-type">{m.type}</div>
        </div>
      ))}
    </div>
  );
};

export const Badge = ({ status }) => {
  const map = {
    pending: 'badge-pending',
    approved: 'badge-approved',
    rejected: 'badge-rejected',
    contribution: 'badge-approved',
    withdrawal: 'badge-blue',
    president: 'badge-gold',
    secretary: 'badge-blue',
    member: 'badge-pending',
    admin: 'badge-gold',
  };
  return <span className={`badge ${map[status] || 'badge-gold'}`}>{status}</span>;
};

export const LoadingPage = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
    <div style={{ textAlign: 'center' }}>
      <div className="spinner" style={{ margin: '0 auto 16px' }} />
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-dim)', letterSpacing: '2px', textTransform: 'uppercase' }}>Loading...</div>
    </div>
  </div>
);