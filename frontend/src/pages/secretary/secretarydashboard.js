import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/sidebar';
import { StatCard, Modal, Alert, ActivityFeed, FundHeader, Badge, PaymentMethodSelector, LoadingPage } from '../../components/shared';
import { getMyFund, getFundTransactions, getFundMembers, getFundActivities, secretaryApprove, recordPayment } from '../../utils/api';
import {
  LayoutDashboard, Users, ClipboardList, Activity,
  Plus, Check, RefreshCw, DollarSign, ArrowDownCircle, FileText
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const SecretaryDashboard = () => {
  const [tab, setTab] = useState('overview');
  const [fund, setFund] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [members, setMembers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRecordPayment, setShowRecordPayment] = useState(false);
  const [showContribReport, setShowContribReport] = useState(false);
  const [showLoanReport, setShowLoanReport] = useState(false);
  const [selectedMember, setSelectedMember] = useState('');
  const [payForm, setPayForm] = useState({ memberId: '', amount: '', method: 'MTN Mobile Money', note: '' });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [approveLoading, setApproveLoading] = useState(null);
  const [recording, setRecording] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const fundRes = await getMyFund();
      setFund(fundRes.data);
      const [txRes, membersRes, actRes] = await Promise.all([
        getFundTransactions(fundRes.data._id),
        getFundMembers(fundRes.data._id),
        getFundActivities(fundRes.data._id),
      ]);
      setTransactions(txRes.data || []);
      setMembers(membersRes.data || []);
      setActivities(actRes.data || []);
    } catch (e) {
      setTransactions([]); setMembers([]); setActivities([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleApprove = async (txId) => {
    setApproveLoading(txId);
    try {
      await secretaryApprove(txId);
      fetchAll();
    } catch (e) {}
    setApproveLoading(null);
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    setFormError(''); setFormSuccess('');
    if (!payForm.memberId) { setFormError('Please select a member'); return; }
    if (!payForm.amount || isNaN(payForm.amount)) { setFormError('Please enter a valid amount'); return; }
    setRecording(true);
    try {
      await recordPayment({ ...payForm, amount: Number(payForm.amount) });
      setFormSuccess('Payment recorded successfully!');
      setPayForm({ memberId: '', amount: '', method: 'MTN Mobile Money', note: '' });
      fetchAll();
      setTimeout(() => { setShowRecordPayment(false); setFormSuccess(''); }, 1500);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to record payment');
    }
    setRecording(false);
  };

  const generateContribReport = (memberId) => {
    const member = members.find(m => m._id === memberId);
    if (!member) return;
    const memberTx = transactions.filter(t => t.member?._id === memberId && t.type === 'contribution');
    const doc = new jsPDF();
    const now = new Date();

    doc.setFillColor(10, 11, 14);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(201, 168, 76);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('IBIMINA', 14, 18);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 200, 200);
    doc.text('Contribution Report', 14, 26);
    doc.text(`Fund: ${fund?.name || 'N/A'} · Generated ${now.toLocaleDateString()}`, 14, 34);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Member: ${member.name}`, 14, 52);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Email: ${member.email} · Phone: ${member.phone || 'N/A'}`, 14, 60);
    doc.text(`Total Contributed: ${(member.totalContributed || 0).toLocaleString()} RWF · Balance: ${(member.balance || 0).toLocaleString()} RWF`, 14, 68);

    doc.setDrawColor(201, 168, 76);
    doc.setLineWidth(0.5);
    doc.line(14, 74, 196, 74);

    autoTable(doc, {
      startY: 82,
      head: [['Reference', 'Amount (RWF)', 'Method', 'Status', 'Date']],
      body: memberTx.map(tx => [
        tx.reference,
        tx.amount?.toLocaleString() || '0',
        tx.method || 'N/A',
        tx.status,
        new Date(tx.createdAt).toLocaleDateString()
      ]),
      theme: 'striped',
      headStyles: { fillColor: [10, 11, 14], textColor: [201, 168, 76], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      margin: { left: 14, right: 14 },
      styles: { fontSize: 9 },
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`IBIMINA Fund Management · Page ${i} of ${pageCount}`, 14, 290);
      doc.text(`Confidential — ${fund?.name}`, 140, 290);
    }
    doc.save(`Contribution_Report_${member.name.replace(' ', '_')}.pdf`);
    setShowContribReport(false);
  };

  const generateLoanReport = (memberId) => {
    const member = members.find(m => m._id === memberId);
    if (!member) return;
    const memberLoans = transactions.filter(t => t.member?._id === memberId && t.type === 'loan');
    const doc = new jsPDF();
    const now = new Date();

    doc.setFillColor(10, 11, 14);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(201, 168, 76);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('IBIMINA', 14, 18);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 200, 200);
    doc.text('Loan Report', 14, 26);
    doc.text(`Fund: ${fund?.name || 'N/A'} · Generated ${now.toLocaleDateString()}`, 14, 34);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Member: ${member.name}`, 14, 52);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Email: ${member.email} · Phone: ${member.phone || 'N/A'}`, 14, 60);
    doc.text(`Total Loans: ${memberLoans.length} · Approved: ${memberLoans.filter(t => t.status === 'approved').length}`, 14, 68);

    doc.setDrawColor(201, 168, 76);
    doc.setLineWidth(0.5);
    doc.line(14, 74, 196, 74);

    autoTable(doc, {
      startY: 82,
      head: [['Reference', 'Amount (RWF)', 'Duration', 'Interest %', 'Total Repayable', 'Status', 'Date']],
      body: memberLoans.map(tx => [
        tx.reference,
        tx.amount?.toLocaleString() || '0',
        tx.loanDuration ? `${tx.loanDuration} months` : 'N/A',
        tx.interestRate ? `${tx.interestRate}%` : 'N/A',
        tx.totalRepayable?.toLocaleString() || 'N/A',
        tx.status,
        new Date(tx.createdAt).toLocaleDateString()
      ]),
      theme: 'striped',
      headStyles: { fillColor: [10, 11, 14], textColor: [201, 168, 76], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      margin: { left: 14, right: 14 },
      styles: { fontSize: 9 },
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`IBIMINA Fund Management · Page ${i} of ${pageCount}`, 14, 290);
      doc.text(`Confidential — ${fund?.name}`, 140, 290);
    }
    doc.save(`Loan_Report_${member.name.replace(' ', '_')}.pdf`);
    setShowLoanReport(false);
  };

  const pendingLoans = transactions.filter(t => (t.type === 'loan' || t.type === 'withdrawal') && t.status === 'pending' && !t.secretaryApproved);
  const contributions = transactions.filter(t => t.type === 'contribution');
  const withdrawals = transactions.filter(t => t.type === 'withdrawal' || t.type === 'loan');

  const navItems = [
    {
      label: 'Navigation',
      items: [
        { label: 'Overview', icon: <LayoutDashboard size={17} />, active: tab === 'overview', onClick: () => setTab('overview') },
        {
          label: 'Loan Requests', icon: <ArrowDownCircle size={17} />,
          active: tab === 'withdrawals', onClick: () => setTab('withdrawals'),
          badge: pendingLoans.length || null
        },
        { label: 'Member Records', icon: <Users size={17} />, active: tab === 'members', onClick: () => setTab('members') },
        { label: 'All Transactions', icon: <FileText size={17} />, active: tab === 'transactions', onClick: () => setTab('transactions') },
        { label: 'Activities', icon: <Activity size={17} />, active: tab === 'activities', onClick: () => setTab('activities') },
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
              <span>Secretary</span>
              <span className="breadcrumb-sep">/</span>
              {fund?.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <div>
                <h1 className="page-title">
                  {tab === 'overview' ? 'Secretary Dashboard' :
                    tab === 'withdrawals' ? 'Loan Requests' :
                      tab === 'members' ? 'Member Records' :
                        tab === 'transactions' ? 'Transaction History' : 'Activity Log'}
                </h1>
                <p className="page-subtitle">
                  {tab === 'overview' ? 'Fund records and payment management' :
                    tab === 'withdrawals' ? 'Review and approve member loan requests' :
                      tab === 'members' ? 'View and export member records' :
                        tab === 'transactions' ? 'Full transaction history' : 'Recent fund activities'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-outline" onClick={() => setShowContribReport(true)}>
                  <FileText size={15} /> Contribution Report
                </button>
                <button className="btn btn-outline" onClick={() => setShowLoanReport(true)}>
                  <FileText size={15} /> Loan Report
                </button>
                <button className="btn btn-primary" onClick={() => setShowRecordPayment(true)}>
                  <Plus size={15} /> Record Payment
                </button>
              </div>
            </div>
          </div>

          {fund && <FundHeader name={fund.name} description={fund.description} />}

          {/* Overview */}
          {tab === 'overview' && (
            <>
              <div className="stats-grid">
                <StatCard label="Total Members" value={members.length} icon={<Users size={22} />} color="blue" />
                <StatCard label="Contributions" value={`${contributions.reduce((s, t) => s + t.amount, 0).toLocaleString()} RWF`} icon={<DollarSign size={22} />} color="green" />
                <StatCard label="Loans Approved" value={`${withdrawals.filter(t => t.status === 'approved').reduce((s, t) => s + t.amount, 0).toLocaleString()} RWF`} icon={<ArrowDownCircle size={22} />} color="red" />
                <StatCard label="Pending Requests" value={pendingLoans.length} icon={<ClipboardList size={22} />} color="gold"
                  sub={pendingLoans.length > 0 ? 'Need your approval' : 'All processed'} />
              </div>

              <div className="grid-2-1">
                <div className="card">
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Recent Transactions</h3>
                  {transactions.slice(0, 8).map(tx => (
                    <div key={tx._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-soft)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '8px',
                          background: tx.type === 'contribution' ? 'var(--green-dim)' : 'var(--red-dim)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: tx.type === 'contribution' ? 'var(--green)' : 'var(--red)'
                        }}>
                          {tx.type === 'contribution' ? <DollarSign size={14} /> : <ArrowDownCircle size={14} />}
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600 }}>{tx.member?.name}</div>
                          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700, color: tx.type === 'contribution' ? 'var(--green)' : 'var(--red)' }}>
                          {tx.type === 'contribution' ? '+' : '-'}{tx.amount.toLocaleString()}
                        </span>
                        <Badge status={tx.status} />
                      </div>
                    </div>
                  ))}
                  {transactions.length === 0 && <div className="empty-state"><div className="empty-icon">💸</div><div className="empty-title">No transactions yet</div></div>}
                </div>
                <div className="card">
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Recent Activities</h3>
                  <ActivityFeed activities={activities.slice(0, 8)} loading={false} />
                </div>
              </div>
            </>
          )}

          {/* Loan Requests Tab */}
          {tab === 'withdrawals' && (
            <div className="card">
              {pendingLoans.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">✅</div>
                  <div className="empty-title">No pending requests</div>
                  <div className="empty-sub">All loan requests have been processed</div>
                </div>
              ) : (
                pendingLoans.map(tx => (
                  <div key={tx._id} style={{ padding: '18px', marginBottom: '12px', background: 'var(--surface2)', borderRadius: 'var(--radius)', border: '1px solid var(--border-soft)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '42px', height: '42px', borderRadius: '50%',
                          background: 'var(--gold-dim)', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontFamily: 'var(--font-display)',
                          fontSize: '16px', color: 'var(--gold)', fontWeight: 700
                        }}>{tx.member?.name?.[0]?.toUpperCase()}</div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{tx.member?.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Ref: {tx.reference}</div>
                          {tx.reason && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Reason: {tx.reason}</div>}
                          {tx.loanDuration && (
                            <div style={{ fontSize: '12px', color: 'var(--gold)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                              Duration: {tx.loanDuration} months · Interest: {tx.interestRate}% · Total: {tx.totalRepayable?.toLocaleString()} RWF
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, color: 'var(--gold)' }}>
                        {tx.amount.toLocaleString()} RWF
                      </div>
                      <button className="btn btn-success" onClick={() => handleApprove(tx._id)} disabled={approveLoading === tx._id}>
                        {approveLoading === tx._id
                          ? <RefreshCw size={14} style={{ animation: 'spin 0.8s linear infinite' }} />
                          : <><Check size={14} /> Approve & Forward to President</>}
                      </button>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', marginTop: '10px' }}>
                      Requested {new Date(tx.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Members Tab */}
          {tab === 'members' && (
            <div className="card">
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr><th>Member</th><th>Email</th><th>Phone</th><th>Balance</th><th>Total Contributed</th><th>Joined</th></tr>
                  </thead>
                  <tbody>
                    {members.map(m => (
                      <tr key={m._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '34px', height: '34px', borderRadius: '50%',
                              background: 'var(--gold-dim)', display: 'flex', alignItems: 'center',
                              justifyContent: 'center', fontFamily: 'var(--font-display)',
                              fontSize: '13px', color: 'var(--gold)', fontWeight: 700
                            }}>{m.name?.[0]?.toUpperCase()}</div>
                            {m.name}
                          </div>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{m.email}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{m.phone || '—'}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--green)', fontWeight: 600 }}>{(m.balance || 0).toLocaleString()} RWF</td>
                        <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--gold)' }}>{(m.totalContributed || 0).toLocaleString()} RWF</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{new Date(m.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Transactions Tab */}
          {tab === 'transactions' && (
            <div className="card">
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr><th>Member</th><th>Type</th><th>Amount</th><th>Method</th><th>Ref</th><th>Status</th><th>Date</th></tr>
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
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)' }}>{tx.reference}</td>
                        <td><Badge status={tx.status} /></td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{new Date(tx.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Activities Tab */}
          {tab === 'activities' && (
            <div className="card">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Activity Log</h3>
              <ActivityFeed activities={activities} loading={false} />
            </div>
          )}

        </div>
      </div>

      {/* Record Payment Modal */}
      {showRecordPayment && (
        <Modal title="Record Member Payment" subtitle="Manually record a contribution payment for a member"
          onClose={() => { setShowRecordPayment(false); setFormError(''); setFormSuccess(''); }}>
          <form onSubmit={handleRecordPayment}>
            {formError && <Alert type="error">{formError}</Alert>}
            {formSuccess && <Alert type="success">{formSuccess}</Alert>}
            <div className="form-group">
              <label className="form-label">Select Member *</label>
              <select className="form-select" value={payForm.memberId} onChange={e => setPayForm({ ...payForm, memberId: e.target.value })} required>
                <option value="">— Choose member —</option>
                {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Amount (RWF) *</label>
              <input className="form-input" type="number" placeholder="0" min="1"
                value={payForm.amount} onChange={e => setPayForm({ ...payForm, amount: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <PaymentMethodSelector selected={payForm.method} onChange={m => setPayForm({ ...payForm, method: m })} />
            </div>
            <div className="form-group">
              <label className="form-label">Note (Optional)</label>
              <input className="form-input" placeholder="Any additional notes..."
                value={payForm.note} onChange={e => setPayForm({ ...payForm, note: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={() => setShowRecordPayment(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={recording}>
                {recording ? 'Recording...' : <><Check size={15} /> Record Payment</>}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Contribution Report Modal */}
      {showContribReport && (
        <Modal title="Contribution Report" subtitle="Select a member to generate their contribution report"
          onClose={() => { setShowContribReport(false); setSelectedMember(''); }}>
          <div className="form-group">
            <label className="form-label">Select Member *</label>
            <select className="form-select" value={selectedMember} onChange={e => setSelectedMember(e.target.value)}>
              <option value="">— Choose member —</option>
              {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
            </select>
          </div>
          {selectedMember && (
            <div style={{ padding: '12px', background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
              {transactions.filter(t => t.member?._id === selectedMember && t.type === 'contribution').length} contribution(s) found
            </div>
          )}
          <div className="modal-actions">
            <button className="btn btn-outline" onClick={() => setShowContribReport(false)}>Cancel</button>
            <button className="btn btn-primary" disabled={!selectedMember} onClick={() => generateContribReport(selectedMember)}>
              <FileText size={15} /> Download PDF
            </button>
          </div>
        </Modal>
      )}

      {/* Loan Report Modal */}
      {showLoanReport && (
        <Modal title="Loan Report" subtitle="Select a member to generate their loan report"
          onClose={() => { setShowLoanReport(false); setSelectedMember(''); }}>
          <div className="form-group">
            <label className="form-label">Select Member *</label>
            <select className="form-select" value={selectedMember} onChange={e => setSelectedMember(e.target.value)}>
              <option value="">— Choose member —</option>
              {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
            </select>
          </div>
          {selectedMember && (
            <div style={{ padding: '12px', background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
              {transactions.filter(t => t.member?._id === selectedMember && t.type === 'loan').length} loan(s) found
            </div>
          )}
          <div className="modal-actions">
            <button className="btn btn-outline" onClick={() => setShowLoanReport(false)}>Cancel</button>
            <button className="btn btn-primary" disabled={!selectedMember} onClick={() => generateLoanReport(selectedMember)}>
              <FileText size={15} /> Download PDF
            </button>
          </div>
        </Modal>
      )}

    </div>
  );
};

export default SecretaryDashboard;