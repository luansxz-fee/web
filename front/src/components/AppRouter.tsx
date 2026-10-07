import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import Dashboard from '../pages/Dashboard';
import MedicationsPage from '../pages/MedicationsPage';
import HistoryPage from '../pages/HistoryPage';
import ProfilePage from '../pages/ProfilePage';
import Layout from './Layout';

export type Page = 'landing' | 'login' | 'register' | 'forgot-password' | 'reset-password' | 'dashboard' | 'medications' | 'history' | 'profile';

export default function AppRouter() {
  const { usuario, isLoading } = useAuth();
  const [pagina, setPagina] = useState<Page>('landing');
  const [tokenRecuperacao, setTokenRecuperacao] = useState('');

  if (isLoading) return (
    <div className="loading-screen">
      <div className="loading-logo">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="22" stroke="#2563EB" strokeWidth="2.5" fill="none" />
          <path d="M16 24h4l3-8 4 16 3-8h2" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>MedSync</span>
      </div>
      <div className="loading-spinner" />
    </div>
  );

  const navegar = (p: Page, token?: string) => {
    if (token) setTokenRecuperacao(token);
    setPagina(p);
  };

  if (!usuario) {
    if (pagina === 'login') return <LoginPage navigate={navegar} />;
    if (pagina === 'register') return <RegisterPage navigate={navegar} />;
    if (pagina === 'forgot-password') return <ForgotPasswordPage navigate={navegar} />;
    if (pagina === 'reset-password') return <ResetPasswordPage navigate={navegar} token={tokenRecuperacao} />;
    return <LandingPage navigate={navegar} />;
  }

  return (
    <Layout page={pagina} navigate={navegar}>
      {pagina === 'medications' && <MedicationsPage />}
      {pagina === 'history' && <HistoryPage />}
      {pagina === 'profile' && <ProfilePage navigate={navegar} />}
      {(pagina === 'dashboard' || pagina === 'landing' || pagina === 'login' || pagina === 'register' || pagina === 'forgot-password' || pagina === 'reset-password') && <Dashboard navigate={navegar} />}
    </Layout>
  );
}
