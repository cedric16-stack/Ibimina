import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/sidebar';
import { StatCard, Modal, Alert, ActivityFeed, Badge, LoadingPage } from '../../components/shared';
import { getFunds, createFund, deleteFund, getAllUsers, getGlobalActivities } from '../../utils/api';
import { getFunds, createFund, deleteFund, getAllUsers, getGlobalActivities, getFundTransactions } from '../../utils/api';
import {
  LayoutDashboard, Folder, Users, Activity,
  Plus, Trash2, RefreshCw, DollarSign, TrendingUp, Shield, ClipboardList
} from 'lucide-react';

const AdminDashboard = () => {
  const [tab, setTab] = useState('overview');
  const [funds, setFunds] = useState([]);
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actLoading, setActLoading] = useState(false);
  const [showCreateFund, setShowCreateFund] = useState(false);
  const [fundForm, setFundForm] = useState({ name: '', presidentEmail: '', presidentName: '', presidentPhone: '' });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [requests, setRequests] = useState([]);
  const [reqLoading, setReqLoading] = useState(false);
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [fundsRes, usersRes] = await Promise.all([getFunds(), getAllUsers()]);
      setFunds(fundsRes.data || []);
      setUsers(usersRes.data || []);
    } catch (e) {
      setFunds([]);
      setUsers([]);
    }
    setLoading(false);
  }, []);

  const fetchActivities = useCallback(async () => {
    setActLoading(true);
    try {
      const res = await getGlobalActivities();
      setActivities(res.data || []);
    } catch (e) {
      setActivities([]);
    }
    setActLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { if (tab === 'activity') fetchActivities(); }, [tab, fetchActivities]);
 
  const fetchRequests = useCallback(async () => {
  setReqLoading(true);
  try {
    const fundsRes = await getFunds();
    const allRequests = [];
    for (const fund of fundsRes.data) {
      const txRes = await getFundTransactions(fund._id);
      const pending = txRes.data.filter(t => t.status === 'pending');
      pending.forEach(t => allRequests.push({ ...t, fundName: fund.name }));
    }
    setRequests(allRequests);
  } catch (e) {}
  setReqLoading(false);
}, []);

  const handleCreateFund = async (e) => {
  e.preventDefault();
  setFormError(''); setFormSuccess('');
  setCreating(true);
  try {
   const res = await createFund(fundForm);
    const setupToken = res.data.setupToken;
    const setupLink = setupToken 
      ? `${window.location.origin}/president/setup?token=${setupToken}` 
      : null;
    setFormSuccess(
      setupLink 
        ? `Fund created! President setup link: ${setupLink}` 
        : `Fund "${fundForm.name}" created successfully!`
    );
    setFundForm({ name: '', presidentEmail: '', presidentName: '', presidentPhone: '' });
    fetchData();
    setTimeout(() => { setShowCreateFund(false); setFormSuccess(''); }, 8000);
  } catch (err) {
    setFormError(err.response?.data?.message || 'Failed to create fund');
  }
  setCreating(false);
};
  const handleDeleteFund = async (id, name) => {
    if (!window.confirm(`Delete fund "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await deleteFund(id);
      fetchData();
    } catch (e) {}
    setDeleting(null);
  };

  const totalBalance = funds.reduce((s, f) => s + (f.totalBalance || 0), 0);
  const totalContributions = funds.reduce((s, f) => s + (f.totalContributions || 0), 0);

  const navItems = [
  {
    label: 'Navigation',
    items: [
      { label: 'Overview', icon: <LayoutDashboard size={17} />, active: tab === 'overview', onClick: () => setTab('overview') },
      { label: 'Funds', icon: <Folder size={17} />, active: tab === 'funds', onClick: () => setTab('funds') },
      { label: 'Users', icon: <Users size={17} />, active: tab === 'users', onClick: () => setTab('users') },
      { label: 'Requests', icon: <ClipboardList size={17} />, active: tab === 'requests', onClick: () => setTab('requests') },
      { label: 'Activity Log', icon: <Activity size={17} />, active: tab === 'activity', onClick: () => setTab('activity') },
    ]
  }
];

  if (loading) return (
    <div className="app-layout">
      <Sidebar navItems={navItems} />
      <div className="main-content"><LoadingPage /></div>
    </div>
  );

  return (
    <div className="app-layout">
      <Sidebar navItems={navItems} />
      <div className="main-content">
        <div className="page">

          <div className="page-header">
            <div className="breadcrumb">
              <Shield size={12} />
              <span className="breadcrumb-sep">/</span>
              Admin Panel
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <div>
                <h1 className="page-title">Admin Dashboard</h1>
                <p className="page-subtitle">Manage funds, users and platform overview</p>
              </div>
              {tab === 'funds' && (
                <button className="btn btn-primary" onClick={() => setShowCreateFund(true)}>
                  <Plus size={15} /> New Fund
                </button>
              )}
            </div>
          </div>

          {tab === 'overview' && (
            <>
              <div className="stats-grid">
                <StatCard label="Total Funds" value={funds.length} icon={<Folder size={22} />} color="gold" />
                <StatCard label="Total Users" value={users.length} icon={<Users size={22} />} color="blue" />
                <StatCard label="Platform Balance" value={`${totalBalance.toLocaleString()} RWF`} icon={<DollarSign size={22} />} color="green" />
                <StatCard label="Total Contributions" value={`${totalContributions.toLocaleString()} RWF`} icon={<TrendingUp size={22} />} color="gold" />
              </div>

              <div className="grid-2-1" style={{ gap: '20px' }}>
                <div className="card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700 }}>Recent Funds</h3>
                    <button className="btn btn-outline btn-sm" onClick={() => setTab('funds')}>View All</button>
                  </div>
                  {funds.length === 0 && (
                    <div className="empty-state">
                      <div className="empty-icon">🏦</div>
                      <div className="empty-title">No funds yet</div>
                    </div>
                  )}
                  {funds.slice(0, 5).map(fund => (
                    <div key={fund._id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '14px 0', borderBottom: '1px solid var(--border-soft)'
                    }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{fund.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {fund.president?.name || 'No president'} · {fund.members?.length || 0} members
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--gold)', fontWeight: 600 }}>
                          {(fund.totalBalance || 0).toLocaleString()} RWF
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                          {new Date(fund.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="card">
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>User Breakdown</h3>
                  {['admin', 'president', 'secretary', 'member'].map(role => {
                    const count = users.filter(u => u.role === role).length;
                    return (
                      <div key={role} style={{ marginBottom: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontSize: '13px', textTransform: 'capitalize', fontWeight: 500 }}>{role}s</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--gold)' }}>{count}</span>
                        </div>
                        <div style={{ height: '4px', background: 'var(--surface2)', borderRadius: '2px' }}>
                          <div style={{
                            height: '100%', borderRadius: '2px',
                            background: 'linear-gradient(90deg, var(--gold), var(--gold-light))',
                            width: `${users.length ? (count / users.length) * 100 : 0}%`,
                            transition: 'width 1s ease'
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {tab === 'funds' && (
            <div>
              {funds.length === 0 ? (
                <div className="card">
                  <div className="empty-state">
                    <div className="empty-icon">🏦</div>
                    <div className="empty-title">No funds created yet</div>
                    <div className="empty-sub">Create your first fund to get started</div>
                    <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => setShowCreateFund(true)}>
                      <Plus size={15} /> Create Fund
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {funds.map(fund => (
                    <div key={fund._id} className="card card-gold" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <div style={{
                        width: '52px', height: '52px', borderRadius: '14px',
                        background: 'var(--gold-dim)', border: '1px solid var(--border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 900, color: 'var(--gold)',
                        flexShrink: 0
                      }}>
                        {fund.name ? fund.name[0].toUpperCase() : '?'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700 }}>{fund.name}</div>
                        <div style={{ display: 'flex', gap: '16px', marginTop: '6px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            👤 President: <strong style={{ color: 'var(--text)' }}>{fund.president?.name || 'Not assigned'}</strong>
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            👥 {fund.members?.length || 0} members
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            📅 {new Date(fund.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-dim)', marginBottom: '2px' }}>Balance</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: 'var(--gold)' }}>
                          {(fund.totalBalance || 0).toLocaleString()} RWF
                        </div>
                      </div>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteFund(fund._id, fund.name)}
                        disabled={deleting === fund._id}
                      >
                        {deleting === fund._id ? <RefreshCw size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'users' && (
            <div className="card">
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700 }}>All Users ({users.length})</h3>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Fund</th>
                      <th>Balance</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '32px', height: '32px', borderRadius: '50%',
                              background: 'var(--gold-dim)', border: '1px solid var(--border)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontFamily: 'var(--font-display)', fontSize: '13px', color: 'var(--gold)', fontWeight: 700
                            }}>
                              {u.name ? u.name[0].toUpperCase() : '?'}
                            </div>
                            {u.name}
                          </div>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{u.email}</td>
                        <td><Badge status={u.role} /></td>
                        <td>{u.fund?.name || <span style={{ color: 'var(--text-dim)' }}>—</span>}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--gold)' }}>{(u.balance || 0).toLocaleString()} RWF</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'activity' && (
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700 }}>Global Activity Log</h3>
                <button className="btn btn-outline btn-sm" onClick={fetchActivities}>
                  <RefreshCw size={13} /> Refresh
                </button>
              </div>
              <ActivityFeed activities={activities} loading={actLoading} />
            </div>
          )}
        </div>
      </div>

     {showCreateFund && (
  <Modal
    title="Create New Fund"
    subtitle="Set up a new community savings fund"
    onClose={() => { setShowCreateFund(false); setFormError(''); setFormSuccess(''); }}
  >
    <form onSubmit={handleCreateFund}>
      {formError && <Alert type="error">{formError}</Alert>}
      {formSuccess && <Alert type="success">{formSuccess}</Alert>}
      <div className="form-group">
        <label className="form-label">Fund Name *</label>
        <input className="form-input" placeholder="e.g. Kigali Savings Circle"
          value={fundForm.name} onChange={e => setFundForm({ ...fundForm, name: e.target.value })} required />
      </div>
      <div style={{ borderTop: '1px solid var(--border-soft)', marginTop: '8px', paddingTop: '16px' }}>
        <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          President Details (Optional)
        </div>
        <div className="form-group">
          <label className="form-label">President Full Name</label>
          <input className="form-input" placeholder="John Doe"
            value={fundForm.presidentName} onChange={e => setFundForm({ ...fundForm, presidentName: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">President Email</label>
          <input className="form-input" type="email" placeholder="president@email.com"
            value={fundForm.presidentEmail} onChange={e => setFundForm({ ...fundForm, presidentEmail: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">President Phone</label>
          <input className="form-input" placeholder="+250 7XX XXX XXX"
            value={fundForm.presidentPhone} onChange={e => setFundForm({ ...fundForm, presidentPhone: e.target.value })} />
        </div>
        
      </div>
      <div className="modal-actions">
        <button type="button" className="btn btn-outline" onClick={() => setShowCreateFund(false)}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={creating}>
          {creating ? 'Creating...' : <><Plus size={15} /> Create Fund</>}
        </button>
      </div>
    </form>
  </Modal>
)}
{tab === 'requests' && (
  <div className="card">
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700 }}>
        All Pending Requests
      </h3>
      <button className="btn btn-outline btn-sm" onClick={fetchRequests}>
        <RefreshCw size={13} /> Refresh
      </button>
    </div>
    {reqLoading ? <LoadingPage /> : requests.length === 0 ? (
      <div className="empty-state">
        <div className="empty-icon">✅</div>
        <div className="empty-title">No pending requests</div>
        <div className="empty-sub">All requests have been processed</div>
      </div>
    ) : (
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Member</th>
              <th>Fund</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Reason</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(tx => (
              <tr key={tx._id}>
                <td>{tx.member?.name}</td>
                <td style={{ color: 'var(--gold)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{tx.fundName}</td>
                <td><Badge status={tx.type} /></td>
                <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--gold)', fontWeight: 600 }}>
                  {tx.amount?.toLocaleString()} RWF
                </td>
                <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{tx.reason || '—'}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                  {new Date(tx.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
)}
    </div>
  );
};

export default AdminDashboard;