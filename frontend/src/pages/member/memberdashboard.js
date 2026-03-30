import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/sidebar';
import { StatCard, Modal, Alert, FundHeader, Badge, PaymentMethodSelector, LoadingPage } from '../../components/shared';
import { getMyFund, getMyTransactions, contribute, withdrawRequest, updateProfile } from '../../utils/api';
import { useAuth } from '../../context/authcontext';
import {
  User, Home, ArrowDownCircle, ArrowUpCircle, History,
  DollarSign, TrendingUp, Camera, Save
} from 'lucide-react';

const MemberDashboard = () => {
  const { user, refreshUser } = useAuth();
  const [tab, setTab] = useState('overview');
  const [fund, setFund] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showContribute, setShowContribute] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [contribForm, setContribForm] = useState({ amount: '', method: 'MTN Mobile Money' });
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', reason: '' });
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '', phone: user?.phone || '',
    age: user?.age || '', gender: user?.gender || '', photo: user?.photo || ''
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [fundRes, txRes] = await Promise.all([getMyFund(), getMyTransactions()]);
      setFund(fundRes.data);
      setTransactions(txRes.data);
    } catch (e) {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '', phone: user.phone || '',
        age: user.age || '', gender: user.gender || '', photo: user.photo || ''
      });
    }
  }, [user]);

  const handleContribute = async (e) => {
    e.preventDefault();
    setFormError(''); setFormSuccess('');
    if (!contribForm.amount || isNaN(contribForm.amount)) { setFormError('Enter a valid amount'); return; }
    setSubmitting(true);
    try {
      await contribute({ amount: Number(contribForm.amount), method: contribForm.method });
      setFormSuccess('Contribution successful!');
      setContribForm({ amount: '', method: 'MTN Mobile Money' });
      fetchData();
      setTimeout(() => { setShowContribute(false); setFormSuccess(''); }, 1500);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Contribution failed');
    }
    setSubmitting(false);
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setFormError(''); setFormSuccess('');
    if (!withdrawForm.amount || isNaN(withdrawForm.amount)) { setFormError('Enter a valid amount'); return; }
    setSubmitting(true);
    try {
      await withdrawRequest({ amount: Number(withdrawForm.amount), reason: withdrawForm.reason });
      setFormSuccess('Withdrawal request submitted!');
      setWithdrawForm({ amount: '', reason: '' });
      fetchData();
      setTimeout(() => { setShowWithdraw(false); setFormSuccess(''); }, 1500);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Request failed');
    }
    setSubmitting(false);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setFormError(''); setFormSuccess('');
    try {
      await updateProfile(profileForm);
      await refreshUser();
      setFormSuccess('Profile updated successfully!');
    } catch (err) {
      setFormError('Failed to update profile');
    }
    setSavingProfile(false);
  };

  const myBalance = user?.balance || 0;
  const myContributed = user?.totalContributed || 0;
  const pendingWithdrawals = transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending');

  const navItems = [
    {
      label: 'Navigation',
      items: [
        { label: 'Overview', icon: <Home size={17} />, active: tab === 'overview', onClick: () => setTab('overview') },
        { label: 'My Profile', icon: <User size={17} />, active: tab === 'profile', onClick: () => setTab('profile') },
        { label: 'Contribute', icon: <ArrowUpCircle size={17} />, active: tab === 'contribute', onClick: () => setTab('contribute') },
        { label: 'Withdraw', icon: <ArrowDownCircle size={17} />, active: tab === 'withdraw', onClick: () => setTab('withdraw') },
        { label: 'History', icon: <History size={17} />, active: tab === 'history', onClick: () => setTab('history') },
      ]
    }
  ];

  if (loading) return (
    <div className="app-layout">
      <Sidebar navItems={navItems} fundName={fund?.name} />
      <div className="main-content"><LoadingPage /></div>
    </div>
  );

  return (
    <div className="app-layout">
      <Sidebar navItems={navItems} fundName={fund?.name} />
      <div className="main-content">
        <div className="page">

          <div className="page-header">
            <div className="breadcrumb">
              <span>Member</span>
              <span className="breadcrumb-sep">/</span>
              {fund?.name || 'My Fund'}
            </div>
            <h1 className="page-title">
              {tab === 'overview' ? `Welcome back, ${user?.name?.split(' ')[0]}` :
                tab === 'profile' ? 'My Profile' :
                  tab === 'contribute' ? 'Make a Contribution' :
                    tab === 'withdraw' ? 'Withdrawal Request' : 'Transaction History'}
            </h1>
          </div>

          {fund && <FundHeader name={fund.name} balance={fund.totalBalance} description={fund.description} />}

          {/* Overview */}
          {tab === 'overview' && (
            <>
              <div className="stats-grid">
                <StatCard label="My Balance" value={`${myBalance.toLocaleString()} RWF`} icon={<DollarSign size={22} />} color="gold" />
                <StatCard label="Total Contributed" value={`${myContributed.toLocaleString()} RWF`} icon={<TrendingUp size={22} />} color="green" />
                <StatCard label="Pending Requests" value={pendingWithdrawals.length} icon={<ArrowDownCircle size={22} />} color="blue" />
                <StatCard label="Total Transactions" value={transactions.length} icon={<History size={22} />} color="gold" />
              </div>

              <div className="grid-2">
                <div className="card">
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Quick Actions</h3>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <button className="btn btn-primary btn-lg" style={{ justifyContent: 'center' }}
                      onClick={() => setTab('contribute')}>
                      <ArrowUpCircle size={18} /> Contribute to Fund
                    </button>
                    <button className="btn btn-outline btn-lg" style={{ justifyContent: 'center' }}
                      onClick={() => setTab('withdraw')}>
                      <ArrowDownCircle size={18} /> Request Withdrawal
                    </button>
                    <button className="btn btn-outline btn-lg" style={{ justifyContent: 'center' }}
                      onClick={() => setTab('history')}>
                      <History size={18} /> View History
                    </button>
                  </div>
                </div>

                <div className="card">
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Recent Transactions</h3>
                  {transactions.slice(0, 5).map(tx => (
                    <div key={tx._id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 0', borderBottom: '1px solid var(--border-soft)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '8px',
                          background: tx.type === 'contribution' ? 'var(--green-dim)' : 'var(--red-dim)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: tx.type === 'contribution' ? 'var(--green)' : 'var(--red)'
                        }}>
                          {tx.type === 'contribution' ? <ArrowUpCircle size={14} /> : <ArrowDownCircle size={14} />}
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, textTransform: 'capitalize' }}>{tx.type}</div>
                          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{
                          fontFamily: 'var(--font-mono)', fontWeight: 700,
                          color: tx.type === 'contribution' ? 'var(--green)' : 'var(--red)'
                        }}>
                          {tx.type === 'contribution' ? '+' : '-'}{tx.amount.toLocaleString()}
                        </span>
                        <Badge status={tx.status} />
                      </div>
                    </div>
                  ))}
                  {transactions.length === 0 && <div className="empty-state"><div className="empty-title">No transactions yet</div></div>}
                </div>
              </div>
            </>
          )}

          {/* Profile Tab */}
          {tab === 'profile' && (
            <div className="grid-2">
              <div>
                {/* Profile Hero */}
                <div className="profile-hero" style={{ marginBottom: '20px' }}>
                  <div className="profile-photo-wrapper">
                    {profileForm.photo ? (
                      <img src={profileForm.photo} alt={user?.name} className="profile-photo" />
                    ) : (
                      <div className="profile-photo-placeholder">
                        {user?.name?.[0]?.toUpperCase() || 'M'}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="profile-name">{user?.name}</div>
                    <div className="profile-role">{user?.role}</div>
                    <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                      {fund?.name && <span>📍 {fund.name}</span>}
                    </div>
                  </div>
                </div>

                {/* Profile Details */}
                <div className="card">
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Fund Stats</h3>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {[
                      { label: 'Balance', value: `${myBalance.toLocaleString()} RWF`, color: 'var(--gold)' },
                      { label: 'Total Contributed', value: `${myContributed.toLocaleString()} RWF`, color: 'var(--green)' },
                      { label: 'Transactions', value: transactions.length, color: 'var(--blue)' },
                    ].map(item => (
                      <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-soft)' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{item.label}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: item.color }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Edit Profile Form */}
              <div className="card">
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Edit Profile</h3>
                <form onSubmit={handleSaveProfile}>
                  {formError && <Alert type="error">{formError}</Alert>}
                  {formSuccess && <Alert type="success">{formSuccess}</Alert>}
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className="form-input" value={profileForm.name}
                      onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input className="form-input" placeholder="+250 7XX XXX XXX" value={profileForm.phone}
                      onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} />
                  </div>
                  <div className="grid-2" style={{ gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">Age</label>
                      <input className="form-input" type="number" placeholder="—" min="18" max="100"
                        value={profileForm.age} onChange={e => setProfileForm({ ...profileForm, age: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Gender</label>
                      <select className="form-select" value={profileForm.gender}
                        onChange={e => setProfileForm({ ...profileForm, gender: e.target.value })}>
                        <option value="">— Select —</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label"><Camera size={12} style={{ display: 'inline', marginRight: '6px' }} />Photo URL</label>
                    <input className="form-input" placeholder="https://..." value={profileForm.photo}
                      onChange={e => setProfileForm({ ...profileForm, photo: e.target.value })} />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={savingProfile}>
                    {savingProfile ? 'Saving...' : <><Save size={15} /> Save Changes</>}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Contribute Tab */}
          {tab === 'contribute' && (
            <div style={{ maxWidth: '520px' }}>
              <div className="card">
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, marginBottom: '6px' }}>
                  Make a Contribution
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>
                  Your current balance: <strong style={{ color: 'var(--gold)', fontFamily: 'var(--font-mono)' }}>{myBalance.toLocaleString()} RWF</strong>
                </p>
                <form onSubmit={handleContribute}>
                  {formError && <Alert type="error">{formError}</Alert>}
                  {formSuccess && <Alert type="success">{formSuccess}</Alert>}
                  <div className="form-group">
                    <label className="form-label">Amount (RWF) *</label>
                    <input className="form-input" type="number" placeholder="Enter amount"
                      min="1" value={contribForm.amount}
                      onChange={e => setContribForm({ ...contribForm, amount: e.target.value })} required
                      style={{ fontSize: '20px', fontFamily: 'var(--font-mono)', fontWeight: 700 }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Payment Method</label>
                    <PaymentMethodSelector selected={contribForm.method} onChange={m => setContribForm({ ...contribForm, method: m })} />
                  </div>

                  {/* Method details */}
                  {contribForm.method === 'MTN Mobile Money' && (
                    <div className="alert alert-info" style={{ marginBottom: '18px' }}>
                      📱 Send to: <strong>0788-IBIMINA</strong> · Code: <strong>*182#</strong>
                    </div>
                  )}
                  {contribForm.method === 'BK Bank' && (
                    <div className="alert alert-info" style={{ marginBottom: '18px' }}>
                      🏦 BK Account: <strong>00040-IBIMINA-001</strong> · Branch: Kigali
                    </div>
                  )}
                  {contribForm.method === 'Equity Bank' && (
                    <div className="alert alert-info" style={{ marginBottom: '18px' }}>
                      🏦 Equity Account: <strong>6022-IBIMINA-FND</strong> · Branch: Nyarugenge
                    </div>
                  )}

                  <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={submitting}>
                    {submitting ? 'Processing...' : <><ArrowUpCircle size={18} /> Confirm Contribution</>}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Withdraw Tab */}
          {tab === 'withdraw' && (
            <div style={{ maxWidth: '520px' }}>
              <div className="card">
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, marginBottom: '6px' }}>
                  Request Withdrawal
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>
                  Available balance: <strong style={{ color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>{myBalance.toLocaleString()} RWF</strong>
                </p>

                {pendingWithdrawals.length > 0 && (
                  <div className="alert alert-info" style={{ marginBottom: '18px' }}>
                    You have {pendingWithdrawals.length} pending request(s) awaiting approval.
                  </div>
                )}

                <form onSubmit={handleWithdraw}>
                  {formError && <Alert type="error">{formError}</Alert>}
                  {formSuccess && <Alert type="success">{formSuccess}</Alert>}
                  <div className="form-group">
                    <label className="form-label">Amount (RWF) *</label>
                    <input className="form-input" type="number" placeholder="Enter amount"
                      min="1" max={myBalance} value={withdrawForm.amount}
                      onChange={e => setWithdrawForm({ ...withdrawForm, amount: e.target.value })} required
                      style={{ fontSize: '20px', fontFamily: 'var(--font-mono)', fontWeight: 700 }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Reason for Withdrawal</label>
                    <textarea className="form-textarea"
                      placeholder="Please explain why you need this withdrawal..."
                      value={withdrawForm.reason}
                      onChange={e => setWithdrawForm({ ...withdrawForm, reason: e.target.value })}
                      rows={3} />
                  </div>
                  <div style={{
                    padding: '14px', background: 'var(--surface2)', borderRadius: 'var(--radius-sm)',
                    marginBottom: '18px', fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)'
                  }}>
                    ℹ️ Requests require approval from both the Secretary and President before processing.
                  </div>
                  <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={submitting}>
                    {submitting ? 'Submitting...' : <><ArrowDownCircle size={18} /> Submit Request</>}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* History Tab */}
          {tab === 'history' && (
            <div className="card">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>
                My Transaction History
              </h3>
              {transactions.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <div className="empty-title">No transactions yet</div>
                  <div className="empty-sub">Start by making a contribution</div>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr><th>Type</th><th>Amount</th><th>Method</th><th>Ref</th><th>Status</th><th>Date</th></tr>
                    </thead>
                    <tbody>
                      {transactions.map(tx => (
                        <tr key={tx._id}>
                          <td><Badge status={tx.type} /></td>
                          <td style={{
                            fontFamily: 'var(--font-mono)', fontWeight: 700,
                            color: tx.type === 'contribution' ? 'var(--green)' : 'var(--red)'
                          }}>
                            {tx.type === 'contribution' ? '+' : '-'}{tx.amount.toLocaleString()} RWF
                          </td>
                          <td style={{ fontSize: '12px' }}>{tx.method || '—'}</td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)' }}>{tx.reference}</td>
                          <td><Badge status={tx.status} /></td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{new Date(tx.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;