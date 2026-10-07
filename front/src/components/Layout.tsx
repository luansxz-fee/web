import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Page } from './AppRouter';
import Logo from './Logo';

interface LayoutProps {
  children: React.ReactNode;
  page: Page;
  navigate: (p: Page) => void;
}

export default function Layout({ children, page, navigate }: LayoutProps) {
  const { usuario, sair } = useAuth();
  const { theme, toggleTheme, modoIdoso, toggleModo } = useTheme();
  const [menuAberto, setMenuAberto] = useState(false);

  const itensNav = [
    { chave: 'dashboard', rotulo: 'Início', icone: '⊞' },
    { chave: 'medications', rotulo: 'Medicamentos', icone: '💊' },
    { chave: 'history', rotulo: 'Histórico', icone: '📋' },
    { chave: 'profile', rotulo: 'Perfil', icone: '👤' },
  ] as const;

  const paginaAtual = ['dashboard', 'medications', 'history', 'profile'].includes(page) ? page : 'dashboard';

  return (
    <div className="app-layout">
      <aside className={`sidebar ${menuAberto ? 'sidebar--open' : ''}`}>
        <div className="sidebar__header">
          <Logo size="sm" />
          <button className="sidebar__close mobile-only" onClick={() => setMenuAberto(false)}>✕</button>
        </div>

        <nav className="sidebar__nav">
          {itensNav.map(item => (
            <button
              key={item.chave}
              className={`sidebar__item ${paginaAtual === item.chave ? 'sidebar__item--active' : ''}`}
              onClick={() => { navigate(item.chave as Page); setMenuAberto(false); }}
            >
              <span className="sidebar__icon">{item.icone}</span>
              <span>{item.rotulo}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar__footer">
          {modoIdoso && (
            <div className="sidebar__modo-badge">
              Modo Acessibilidade Ativo
            </div>
          )}
          <button className="sidebar__theme-btn" onClick={toggleTheme}>
            {theme === 'light' ? '🌙 Tema Escuro' : '☀️ Tema Claro'}
          </button>
          <div className="sidebar__user">
            <div className="sidebar__avatar">{usuario?.name?.charAt(0).toUpperCase()}</div>
            <div className="sidebar__user-info">
              <span className="sidebar__user-name">{usuario?.name}</span>
              <span className="sidebar__user-email">{usuario?.email}</span>
            </div>
          </div>
          <button className="sidebar__logout" onClick={sair}>Sair</button>
        </div>
      </aside>

      {menuAberto && <div className="overlay" onClick={() => setMenuAberto(false)} />}

      <main className="main-content">
        <header className="topbar">
          <button className="topbar__menu mobile-only" onClick={() => setMenuAberto(true)}>☰</button>
          <div className="topbar__title">
            {itensNav.find(n => n.chave === paginaAtual)?.rotulo || 'MedSync'}
          </div>
          <div className="topbar__actions">
            {modoIdoso && (
              <div className="topbar__modo-badge">Acessibilidade</div>
            )}
            <button className="topbar__theme desktop-only" onClick={toggleTheme} title="Alternar tema">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <div className="topbar__avatar" onClick={() => navigate('profile')}>
              {usuario?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
}
