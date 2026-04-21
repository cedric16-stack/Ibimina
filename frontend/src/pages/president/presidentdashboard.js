import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/sidebar';
import { StatCard, Modal, Alert, ActivityFeed, FundHeader, Badge, LoadingPage } from '../../components/shared';
import {
  LayoutDashboard, Users, ArrowDownCircle, Activity,
  Plus, Trash2, Edit3, Check, X, RefreshCw, UserPlus, FileText, DollarSign, TrendingDown
} from 'lucide-react';
import { getMyFund, updateFundDescription, addUserToFund, removeUserFromFund,
  getFundTransactions, getFundActivities, presidentAction, createMemberByPresident, updateFundTerms } from '../../utils/api';

const PresidentDashboard = () => {
  const [tab, setTab] = useState('overview');
  const [fund, setFund] = useState(null);
  const [savingTerms, setSavingTerms] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(false);
  const [actLoading, setActLoading] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditDesc, setShowEditDesc] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', email: '', phone: '', address: '', password: '', role: 'member' });
  const [desc, setDesc] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchFund = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyFund();
      setFund(res.data);
      setDesc(res.data.description || '');
      setTermsForm({
        termsAndConditions: res.data.termsAndConditions || '',
        loanDefaultRules: res.data.loanDefaultRules || '',
        interestRate: res.data.interestRate || 10,
        maxLoanPercent: res.data.maxLoanPercent || 75,
        maxLoanDuration: res.data.maxLoanDuration || 6
      });
    } catch (e) {}
    setLoading(false);
  }, []);

  const fetchTransactions = useCallback(async (fundId) => {
    setTxLoading(true);
    try {
      const res = await getFundTransactions(fundId);
      setTransactions(res.data.filter(t => t.type === 'withdrawal' || t.type === 'loan'));
    } catch (e) {}
    setTxLoading(false);
  }, []);

  const fetchActivities = useCallback(async (fundId) => {
    setActLoading(true);
    try {
      const res = await getFundActivities(fundId);
      setActivities(res.data);
    } catch (e) {}
    setActLoading(false);
  }, []);

  useEffect(() => { fetchFund(); }, [fetchFund]);

  useEffect(() => {
    if (fund) {
      fetchTransactions(fund._id);
      fetchActivities(fund._id);
    }
  }, [fund, fetchTransactions, fetchActivities]);

  const handleAddUser = async (e) => {
    e.preventDefault();
    setFormError(''); setFormSuccess('');
    try {
      await createMemberByPresident(addForm);
      setFormSuccess(`${addForm.role === 'secretary' ? 'Secretary' : 'Member'} added successfully!`);
      setAddForm({ name: '', email: '', phone: '', address: '', password: '', role: 'member' });
      fetchFund();
      setTimeout(() => { setShowAddUser(false); setFormSuccess(''); }, 1500);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to add user');
    }
  };

  const handleRemoveUser = async (userId, name) => {
    if (!window.confirm(`Remove ${name} from the fund?`)) return;
    try {
      await removeUserFromFund(fund._id, userId);
      fetchFund();
    } catch (e) {}
  };

  const handlePresidentAction = async (txId, action, reason = '') => {
    setActionLoading(txId + action);
    try {
      await presidentAction(txId, { action, rejectionReason: reason });
      fetchTransactions(fund._id);
      fetchActivities(fund._id);
    } catch (e) {}
    setActionLoading(null);
  };

  const handleSaveDesc = async () => {
    try {
      await updateFundDescription(fund._id, { description: desc });
      setFormSuccess('Description updated!');
      fetchFund();
      setTimeout(() => { setShowEditDesc(false); setFormSuccess(''); }, 1500);
    } catch (e) {
      setFormError('Failed to update description');
    }
  };

  const handleSaveTerms = async () => {
    setSavingTerms(true);
    try {
      await updateFundTerms(fund._id, termsForm);
      setFormSuccess('Terms updated successfully!');
      fetchFund();
      setTimeout(() => setFormSuccess(''), 2000);
    } catch (e) {
      setFormError('Failed to update terms');
    }
    setSavingTerms(false);
  };

  const pendingWithdrawals = transactions.filter(t => t.status === 'pending' && t.secretaryApproved);
  const allMembers = [
    ...(fund?.secretary ? [{ ...fund.secretary, role: 'secretary' }] : []),
    ...(fund?.members || []).map(m => ({ ...m, role: 'member' }))
  ];

  const navItems = [
    {
      label: 'Navigation',
      items: [
        { label: 'Overview', icon: <LayoutDashboard size={17} />, active: tab === 'overview', onClick: () => setTab('overview') },
        { label: 'Members', icon: <Users size={17} />, active: tab === 'members', onClick: () => setTab('members') },
        {
          label: 'Loan Requests', icon: <ArrowDownCircle size={17} />, active: tab === 'withdrawals',
          onClick: () => setTab('withdrawals'),
          badge: pendingWithdrawals.length || null
        },
        { label: 'Transactions', icon: <FileText size={17} />, active: tab === 'transactions', onClick: () => setTab('transactions') },
        { label: 'Activities', icon: <Activity size={17} />, active: tab === 'activities', onClick: () => setTab('activities') },
        { label: 'Terms & Conditions', icon: <FileText size={17} />, active: tab === 'terms', onClick: () => setTab('terms') },
      ]
    }
  ];

  if (loading) return (
    <div className="app-layout">
      <Sidebar navItems={navItems} fundName={fund?.name} />
      <div className="main-content"><LoadingPage /></div>
    </div>
  );

  if (!fund) return (
    <div className="app-layout">
      <Sidebar navItems={navItems} />
      <div className="main-content">
        <div className="page">
          <div className="card">
            <div className="empty-state">
              <div className="empty-icon">🏦</div>
              <div className="empty-title">No fund assigned</div>
              <div className="empty-sub">Contact your admin to be assigned to a fund</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-layout">
      <Sidebar navItems={navItems} fundName={fund.name} />
      <div className="main-content">
        <div className="page">

          <div className="page-header">
            <div className="breadcrumb">
              <span>President</span>
              <span className="breadcrumb-sep">/</span>
              {fund.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <div>
                <h1 className="page-title">
                  {tab === 'overview' ? 'Fund Overview' :
                    tab === 'members' ? 'Member Management' :
                      tab === 'withdrawals' ? 'Loan Requests' :
                        tab === 'transactions' ? 'All Transactions' :
                          tab === 'terms' ? 'Terms & Conditions' : 'Activity Log'}
                </h1>
                <p className="page-subtitle">
                  {tab === 'overview' ? 'Monitor fund health and recent activities' :
                    tab === 'members' ? 'Add, remove and manage fund members' :
                      tab === 'withdrawals' ? 'Approve or reject member loan requests' :
                        tab === 'transactions' ? 'Full transaction history' :
                          tab === 'terms' ? 'Set fund rules and loan default policies' : 'Recent fund activities'}
                </p>
              </div>
              {tab === 'members' && (
                <button className="btn btn-primary" onClick={() => setShowAddUser(true)}>
                  <UserPlus size={15} /> Add Member
                </button>
              )}
            </div>
          </div>

          <FundHeader
            name={fund.name}
            balance={fund.totalBalance}
            description={fund.description}
          />
          {!fund.description && (
            <div style={{ marginTop: '-16px', marginBottom: '24px' }}>
              <button className="btn btn-outline btn-sm" onClick={() => setShowEditDesc(true)}>
                <Edit3 size={13} /> Add Fund Description
              </button>
            </div>
          )}
          {fund.description && (
            <div style={{ marginTop: '-16px', marginBottom: '24px' }}>
              <button className="btn btn-outline btn-sm" onClick={() => setShowEditDesc(true)}>
                <Edit3 size={13} /> Edit Description
              </button>
            </div>
          )}

          {tab === 'overview' && (
            <>
              <div className="stats-grid">
                <StatCard label="Total Members" value={allMembers.length} icon={<Users size={22} />} color="blue" />
                <StatCard label="Total Contributions" value={`${(fund.totalContributions || 0).toLocaleString()} RWF`} icon={<DollarSign size={22} />} color="green" />
                <StatCard label="Total Withdrawals" value={`${(fund.totalWithdrawals || 0).toLocaleString()} RWF`} icon={<TrendingDown size={22} />} color="red" />
                <StatCard label="Pending Requests" value={pendingWithdrawals.length} icon={<ArrowDownCircle size={22} />} color="gold"
                  sub={pendingWithdrawals.length > 0 ? 'Awaiting your approval' : 'All clear'} />
              </div>

              <div className="grid-2-1">
                <div className="card">
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Recent Members</h3>
                  {allMembers.slice(0, 5).map(m => (
                    <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--border-soft)' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: 'var(--gold-dim)', border: '1px solid var(--border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--font-display)', fontSize: '14px', color: 'var(--gold)', fontWeight: 700
                      }}>{m.name?.[0]?.toUpperCase()}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: 600 }}>{m.name}</div>
                        <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>{m.email}</div>
                      </div>
                      <Badge status={m.role} />
                    </div>
                  ))}
                  {allMembers.length === 0 && <div className="empty-state"><div className="empty-icon">👥</div><div className="empty-title">No members yet</div></div>}
                </div>
                <div className="card">
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Recent Activity</h3>
                  <ActivityFeed activities={activities.slice(0, 6)} loading={actLoading} />
                </div>
              </div>
            </>
          )}

          {tab === 'members' && (
            <div className="card">
              {allMembers.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">👥</div>
                  <div className="empty-title">No members added yet</div>
                  <div className="empty-sub">Add members and a secretary to get started</div>
                  <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => setShowAddUser(true)}>
                    <UserPlus size={15} /> Add First Member
                  </button>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Member</th>
                        <th>Role</th>
                        <th>Email</th>
                        <th>Balance</th>
                        <th>Contributed</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allMembers.map(m => (
                        <tr key={m._id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{
                                width: '34px', height: '34px', borderRadius: '50%',
                                background: 'var(--gold-dim)', border: '1px solid var(--border)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '13px', color: 'var(--gold)', fontFamily: 'var(--font-display)', fontWeight: 700
                              }}>{m.name?.[0]?.toUpperCase()}</div>
                              {m.name}
                            </div>
                          </td>
                          <td><Badge status={m.role} /></td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{m.email}</td>
                          <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--green)', fontWeight: 600 }}>
                            {(m.balance || 0).toLocaleString()} RWF
                          </td>
                          <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--gold)' }}>
                            {(m.totalContributed || 0).toLocaleString()} RWF
                          </td>
                          <td>
                            <button className="btn btn-danger btn-sm" onClick={() => handleRemoveUser(m._id, m.name)}>
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === 'withdrawals' && (
            <div>
              {pendingWithdrawals.length > 0 && (
                <div className="alert alert-info" style={{ marginBottom: '20px' }}>
                  {pendingWithdrawals.length} loan request(s) awaiting your approval
                </div>
              )}
              <div className="card">
                {transactions.filter(t => t.status === 'pending').length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">✅</div>
                    <div className="empty-title">No pending loan requests</div>
                    <div className="empty-sub">All requests have been processed</div>
                  </div>
                ) : (
                  <div>
                    {transactions.filter(t => t.status === 'pending').map(tx => (
                      <div key={tx._id} style={{
                        padding: '18px', marginBottom: '12px',
                        background: 'var(--surface2)', borderRadius: 'var(--radius)',
                        border: '1px solid var(--border-soft)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '42px', height: '42px', borderRadius: '50%',
                              background: 'var(--gold-dim)', border: '1px solid var(--border)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontFamily: 'var(--font-display)', fontSize: '16px', color: 'var(--gold)', fontWeight: 700
                            }}>{tx.member?.name?.[0]?.toUpperCase()}</div>
                            <div>
                              <div style={{ fontWeight: 600 }}>{tx.member?.name}</div>
                              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                                Ref: {tx.reference}
                              </div>
                              {tx.reason && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Reason: {tx.reason}</div>}
                              {tx.loanDuration && (
                                <div style={{ fontSize: '12px', color: 'var(--gold)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                                  Duration: {tx.loanDuration} months · Interest: {tx.interestRate}% · Total: {tx.totalRepayable?.toLocaleString()} RWF
                                </div>
                              )}
                            </div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: 'var(--gold)' }}>
                              {tx.amount.toLocaleString()} RWF
                            </div>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center', marginTop: '4px' }}>
                              <span className={`badge ${tx.secretaryApproved ? 'badge-approved' : 'badge-pending'}`}>
                                {tx.secretaryApproved ? '✓ Secretary' : '⏳ Secretary'}
                              </span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn btn-success btn-sm"
                              onClick={() => handlePresidentAction(tx._id, 'approve')}
                              disabled={actionLoading === tx._id + 'approve'}>
                              {actionLoading === tx._id + 'approve'
                                ? <RefreshCw size={13} style={{ animation: 'spin 0.8s linear infinite' }} />
                                : <><Check size={13} /> Approve</>}
                            </button>
                            <button className="btn btn-danger btn-sm"
                              onClick={() => {
                                const r = window.prompt('Reason for rejection (optional):');
                                if (r !== null) handlePresidentAction(tx._id, 'reject', r);
                              }}
                              disabled={actionLoading === tx._id + 'reject'}>
                              {actionLoading === tx._id + 'reject'
                                ? <RefreshCw size={13} style={{ animation: 'spin 0.8s linear infinite' }} />
                                : <><X size={13} /> Reject</>}
                            </button>
                          </div>
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', marginTop: '10px' }}>
                          Requested {new Date(tx.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'transactions' && (
            <div className="card">
              {txLoading ? <LoadingPage /> : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Member</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Method</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map(tx => (
                        <tr key={tx._id}>
                          <td>{tx.member?.name}</td>
                          <td><Badge status={tx.type} /></td>
                          <td style={{ fontFamily: 'var(--font-mono)', color: tx.type === 'contribution' ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
                            {tx.type === 'contribution' ? '+' : '-'}{tx.amount.toLocaleString()} RWF
                          </td>
                          <td style={{ fontSize: '12px' }}>{tx.method}</td>
                          <td><Badge status={tx.status} /></td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{new Date(tx.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === 'activities' && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700 }}>Fund Activity Log</h3>
                <button className="btn btn-outline btn-sm" onClick={() => fetchActivities(fund._id)}>
                  <RefreshCw size={13} /> Refresh
                </button>
              </div>
              <ActivityFeed activities={activities} loading={actLoading} />
            </div>
          )}

          {tab === 'terms' && (
            <div className="grid-2">
              <div className="card">
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>
                  Terms & Conditions
                </h3>
                {formError && <Alert type="error">{formError}</Alert>}
                {formSuccess && <Alert type="success">{formSuccess}</Alert>}
                <div className="form-group">
                  <label className="form-label">Terms & Conditions</label>
                  <textarea className="form-textarea" rows={8}
                    placeholder="Enter fund terms and conditions..."
                    value={termsForm.termsAndConditions}
                    onChange={e => setTermsForm({ ...termsForm, termsAndConditions: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Loan Default Rules</label>
                  <textarea className="form-textarea" rows={5}
                    placeholder="Enter rules for loan defaults e.g. penalties, consequences..."
                    value={termsForm.loanDefaultRules}
                    onChange={e => setTermsForm({ ...termsForm, loanDefaultRules: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Interest Rate (%)</label>
                  <input className="form-input" type="number" min="1" max="100"
                    placeholder="e.g. 10"
                    value={termsForm.interestRate}
                    onChange={e => setTermsForm({ ...termsForm, interestRate: Number(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Loan (% of savings)</label>
                  <input className="form-input" type="number" min="1" max="100"
                    placeholder="e.g. 75"
                    value={termsForm.maxLoanPercent}
                    onChange={e => setTermsForm({ ...termsForm, maxLoanPercent: Number(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Loan Duration (months)</label>
                  <select className="form-select" value={termsForm.loanDurationOptions?.length || 6}
                    onChange={e => setTermsForm({ ...termsForm, loanDurationOptions: Array.from({length: Number(e.target.value)}, (_,i) => i+1) })}>
                    {[3,6,9,12].map(n => <option key={n} value={n}>{n} months max</option>)}
                  </select>
                </div>
                <button className="btn btn-primary" onClick={handleSaveTerms} disabled={savingTerms}
                  style={{ width: '100%', justifyContent: 'center' }}>
                  {savingTerms ? 'Saving...' : <><FileText size={15} /> Save Terms</>}
                </button>
              </div>
              <div className="card">
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>
                  Preview
                </h3>
                {fund.termsAndConditions ? (
                  <div>
                    <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
                      Terms & Conditions
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.8, whiteSpace: 'pre-wrap', marginBottom: '20px' }}>
                      {fund.termsAndConditions}
                    </div>
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <div className="empty-title">No terms set yet</div>
                  </div>
                )}
                {fund.loanDefaultRules && (
                  <div>
                    <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
                      Loan Default Rules
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                      {fund.loanDefaultRules}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {showAddUser && (
        <Modal
          title="Add Member or Secretary"
          subtitle="Fill in their details — they'll receive credentials to login"
          onClose={() => { setShowAddUser(false); setFormError(''); setFormSuccess(''); }}
        >
          <form onSubmit={handleAddUser}>
            {formError && <Alert type="error">{formError}</Alert>}
            {formSuccess && <Alert type="success">{formSuccess}</Alert>}
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-input" placeholder="John Doe"
                value={addForm.name} onChange={e => setAddForm({ ...addForm, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input className="form-input" type="email" placeholder="john@email.com"
                value={addForm.email} onChange={e => setAddForm({ ...addForm, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input className="form-input" placeholder="+250 7XX XXX XXX"
                value={addForm.phone} onChange={e => setAddForm({ ...addForm, phone: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input className="form-input" placeholder="Kigali, Rwanda"
                value={addForm.address} onChange={e => setAddForm({ ...addForm, address: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" placeholder="Default: ibimina123"
                value={addForm.password} onChange={e => setAddForm({ ...addForm, password: e.target.value })} />
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                Leave empty to use default password: ibimina123
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-select" value={addForm.role} onChange={e => setAddForm({ ...addForm, role: e.target.value })}>
                <option value="member">Member</option>
                <option value="secretary">Secretary</option>
              </select>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={() => setShowAddUser(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary"><Plus size={15} /> Add User</button>
            </div>
          </form>
        </Modal>
      )}

      {showEditDesc && (
        <Modal
          title="Fund Description"
          subtitle="Add a description to help members understand the fund's purpose"
          onClose={() => { setShowEditDesc(false); setFormError(''); setFormSuccess(''); }}
        >
          {formError && <Alert type="error">{formError}</Alert>}
          {formSuccess && <Alert type="success">{formSuccess}</Alert>}
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" placeholder="Describe the fund's purpose, rules, goals..."
              value={desc} onChange={e => setDesc(e.target.value)} rows={5} />
          </div>
          <div className="modal-actions">
            <button className="btn btn-outline" onClick={() => setShowEditDesc(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSaveDesc}><Edit3 size={15} /> Save Description</button>
          </div>
        </Modal>
      )}

    </div>
  );
};

export default PresidentDashboard;