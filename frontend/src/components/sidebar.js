import React from 'react';
import { useAuth } from '../context/authcontext';
import { LogOut } from 'lucide-react';

const Sidebar = ({ navItems = [], fundName }) => {
  const { user, logoutUser } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">IBIMINA</div>
        <div className="logo-sub">Fund Management</div>
      </div>

      {fundName && (
        <div className="sidebar-fund-badge">
          <div className="fund-badge-label">Active Fund</div>
          <div className="fund-badge-name">{fundName}</div>
        </div>
      )}

      <nav className="sidebar-nav">
        {navItems.map((section, si) => (
          <div key={si}>
            {section?.label && (
              <div className="nav-section-label">{section.label}</div>
            )}
            {(section?.items || []).map((item, ii) => (
              <button
                key={ii}
                className={`nav-item ${item?.active ? 'active' : ''}`}
                onClick={item?.onClick}
              >
                <span className="nav-icon">{item?.icon}</span>
                {item?.label}
                {item?.badge ? (
                  <span style={{
                    marginLeft: 'auto',
                    background: 'var(--red)',
                    color: '#fff',
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    padding: '1px 7px',
                    borderRadius: '100px',
                    fontWeight: 700
                  }}>{item.badge}</span>
                ) : null}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-user">
        {user?.photo ? (
          <img src={user.photo} alt={user?.name} className="user-avatar" />
        ) : (
          <div className="user-avatar-placeholder">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
        )}
        <div className="user-info">
          <div className="user-name">{user?.name}</div>
          <div className="user-role">{user?.role}</div>
        </div>
        <button className="logout-btn" onClick={logoutUser} title="Logout">
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;