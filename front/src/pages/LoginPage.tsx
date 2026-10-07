import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Page } from '../components/AppRouter';
import Logo from '../components/Logo';
import { useTheme } from '../context/ThemeContext';

interface Props { navigate: (p: Page) => void; }

export default function LoginPage({ navigate }: Props) {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !senha) { setErro('Preencha todos os campos.'); return; }
    setCarregando(true);
    setErro('');
    const ok = await login(email, senha);
    setCarregando(false);
    if (!ok) setErro('E-mail ou senha incorretos. Verifique e tente novamente.');
  };

  return (
    <div className="auth-page">
      <div className="auth-page__left">
        <div className="auth-page__brand">
          <Logo size="lg" variant="white" />
          <p>Sua saude organizada, sua vida simplificada.</p>
        </div>
        <div className="auth-page__illustration">
          <div className="auth-orb auth-orb--1" />
          <div className="auth-orb auth-orb--2" />
        </div>
      </div>

      <div className="auth-page__right">
        <div className="auth-page__theme">
          <button className="btn btn--ghost btn--icon" onClick={toggleTheme}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>

        <div className="auth-form-wrap">
          <div className="auth-form__header">
            <h1>Bem-vindo de volta</h1>
            <p>Entre com sua conta MedSync</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>E-mail</label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={erro ? 'input--error' : ''}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label>
                Senha
                <button type="button" className="form-group__link" onClick={() => navigate('forgot-password')}>
                  Esqueceu a senha?
                </button>
              </label>
              <div className="input-wrap">
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  className={erro ? 'input--error' : ''}
                  autoComplete="current-password"
                />
                <button type="button" className="input-eye" onClick={() => setMostrarSenha(!mostrarSenha)}>
                  {mostrarSenha ? '🔒' : '🔓'}
                </button>
              </div>
            </div>

            {erro && <div className="form-error">{erro}</div>}

            <button
              type="submit"
              className={`btn btn--primary btn--block ${carregando ? 'btn--loading' : ''}`}
              disabled={carregando}
            >
              {carregando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="auth-form__footer">
            Nao tem uma conta?{' '}
            <button className="link-btn" onClick={() => navigate('register')}>
              Cadastre-se gratis
            </button>
          </p>

          <button className="auth-back" onClick={() => navigate('landing')}>
            Voltar ao inicio
          </button>
        </div>
      </div>
    </div>
  );
}
