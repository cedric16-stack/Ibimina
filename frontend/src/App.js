//v2.0 - landing page added
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/authcontext';
import LoginPage from './pages/login';
import AdminDashboard from './pages/admin/admindashboard';
import PresidentDashboard from './pages/president/presidentdashboard';
import SecretaryDashboard from './pages/secretary/secretarydashboard';
import MemberDashboard from './pages/member/memberdashboard';
import SetupPage from './pages/Setup';
import LandingPage from './pages/LandingPage';
import GetStarted from './pages/GetStarted';
import './index.css';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--obsidian)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 900,
          background: 'linear-gradient(135deg, #C9A84C, #E8CC7E)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '20px'
        }}>IBIMINA</div>
        <div className="spinner" style={{ margin: '0 auto' }} />
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'president') return <Navigate to="/president" replace />;
    if (user.role === 'secretary') return <Navigate to="/secretary" replace />;
    return <Navigate to="/member" replace />;
  }
  return children;
};

const getHome = (role) => {
  if (role === 'admin') return '/admin';
  if (role === 'president') return '/president';
  if (role === 'secretary') return '/secretary';
  return '/member';
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={getHome(user.role)} replace /> : <LoginPage />} />
      <Route path="/admin" element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} />
      <Route path="/president" element={<PrivateRoute roles={['president']}><PresidentDashboard /></PrivateRoute>} />
      <Route path="/secretary" element={<PrivateRoute roles={['secretary']}><SecretaryDashboard /></PrivateRoute>} />
      <Route path="/member" element={<PrivateRoute roles={['member']}><MemberDashboard /></PrivateRoute>} />
      <Route path="/" element={user ? <Navigate to={getHome(user.role)} replace /> : <LandingPage />} />
      <Route path="/get-started" element={<GetStarted />} />
      <Route path="/" element={user ? <Navigate to={getHome(user.role)} replace /> : <Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
      <Route path="/setup" element={<SetupPage />} /> 
    
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;