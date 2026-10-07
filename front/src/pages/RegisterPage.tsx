import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Page } from '../components/AppRouter';
import Logo from '../components/Logo';
import { useTheme } from '../context/ThemeContext';

interface Props { navigate: (p: Page) => void; }

export default function RegisterPage({ navigate }: Props) {
  const { registrar } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const forca = senha.length === 0 ? 0 : senha.length < 6 ? 1 : senha.length < 10 ? 2 : 3;
  const forcaLabel = ['', 'Fraca', 'Media', 'Forte'];
  const forcaCor = ['', '#EF4444', '#F59E0B', '#10B981'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !email || !senha) { setErro('Preencha todos os campos.'); return; }
    if (senha !== confirmar) { setErro('As senhas nao coincidem.'); return; }
    if (senha.length < 6) { setErro('A senha deve ter pelo menos 6 caracteres.'); return; }
    setCarregando(true);
    setErro('');
    try {
      const ok = await registrar(nome, email, senha);
      if (!ok) setErro('Nao foi possivel criar a conta. Tente novamente.');
    } catch (err: any) {
      setErro(err.message?.includes('ja esta cadastrado') ? 'Este e-mail ja esta cadastrado.' : 'Erro ao criar conta.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__left">
        <div className="auth-page__brand">
          <Logo size="lg" variant="white" />
          <p>Controle total sobre seus medicamentos e sua saude.</p>
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
            <h1>Criar conta gratis</h1>
            <p>Comece a organizar sua saude agora</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nome completo</label>
              <input type="text" placeholder="Seu nome" value={nome} onChange={e => setNome(e.target.value)} autoComplete="name" />
            </div>
            <div className="form-group">
              <label>E-mail</label>
              <input type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
            </div>
            <div className="form-group">
              <label>Senha</label>
              <div className="input-wrap">
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  placeholder="Minimo 6 caracteres"
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  autoComplete="new-password"
                />
                <button type="button" className="input-eye" onClick={() => setMostrarSenha(!mostrarSenha)}>
                  {mostrarSenha ? '🔒' : '🔓'}
                </button>
              </div>
              {senha && (
                <div className="password-strength">
                  <div className="password-strength__bar">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="password-strength__seg"
                        style={{ background: i <= forca ? forcaCor[forca] : undefined }} />
                    ))}
                  </div>
                  <span style={{ color: forcaCor[forca] }}>{forcaLabel[forca]}</span>
                </div>
              )}
            </div>
            <div className="form-group">
              <label>Confirmar senha</label>
              <input
                type={mostrarSenha ? 'text' : 'password'}
                placeholder="Repita a senha"
                value={confirmar}
                onChange={e => setConfirmar(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            {erro && <div className="form-error">{erro}</div>}

            <button
              type="submit"
              className={`btn btn--primary btn--block ${carregando ? 'btn--loading' : ''}`}
              disabled={carregando}
            >
              {carregando ? 'Criando conta...' : 'Criar conta gratuitamente'}
            </button>
          </form>

          <p className="auth-form__footer">
            Ja tem uma conta?{' '}
            <button className="link-btn" onClick={() => navigate('login')}>Fazer login</button>
          </p>

          <button className="auth-back" onClick={() => navigate('landing')}>
            Voltar ao inicio
          </button>
        </div>
      </div>
    </div>
  );
}
