import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Page } from '../components/AppRouter';
import Logo from '../components/Logo';
import { useTheme } from '../context/ThemeContext';

interface Props {
  navigate: (p: Page) => void;
}

const senhaValida = (senha: string) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(senha);

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

  const requisitos = [
    { texto: 'Pelo menos 8 caracteres', ok: senha.length >= 8 },
    { texto: 'Uma letra maiúscula', ok: /[A-Z]/.test(senha) },
    { texto: 'Uma letra minúscula', ok: /[a-z]/.test(senha) },
    { texto: 'Um número', ok: /\d/.test(senha) },
    { texto: 'Um caractere especial', ok: /[^A-Za-z0-9]/.test(senha) },
  ];

  const quantidadeOk = requisitos.filter(r => r.ok).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome.trim() || !email.trim() || !senha || !confirmar) {
      setErro('Preencha todos os campos.');
      return;
    }

    if (!senhaValida(senha)) {
      setErro('A senha não atende a todos os requisitos de segurança.');
      return;
    }

    if (senha !== confirmar) {
      setErro('As senhas não coincidem.');
      return;
    }

    setCarregando(true);
    setErro('');

    try {
      const ok = await registrar(nome, email, senha);
      if (!ok) setErro('Não foi possível criar a conta. Tente novamente.');
    } catch (err: any) {
      setErro(
        err.message?.includes('ja esta cadastrado')
          ? 'Este e-mail já está cadastrado.'
          : 'Erro ao criar conta.'
      );
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__left">
        <div className="auth-page__brand">
          <Logo size="lg" variant="white" />
          <p>Controle total sobre seus medicamentos e sua saúde.</p>
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
            <h1>Criar conta grátis</h1>
            <p>Comece a organizar sua saúde agora</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nome completo</label>
              <input
                type="text"
                placeholder="Seu nome"
                value={nome}
                onChange={e => setNome(e.target.value)}
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label>E-mail</label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label>Senha</label>
              <div className="input-wrap">
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  placeholder="Crie uma senha segura"
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="input-eye"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                >
                  {mostrarSenha ? '🔒' : '🔓'}
                </button>
              </div>

              {senha && (
                <div className="password-strength">
                  <div className="password-strength__bar">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div
                        key={i}
                        className="password-strength__seg"
                        style={{
                          background: i <= quantidadeOk
                            ? quantidadeOk <= 2 ? '#EF4444'
                              : quantidadeOk <= 4 ? '#F59E0B'
                              : '#10B981'
                            : undefined,
                        }}
                      />
                    ))}
                  </div>
                  <span>
                    {quantidadeOk === 5 ? 'Forte' : 'Senha incompleta'}
                  </span>
                </div>
              )}

              <ul className="password-requirements">
                {requisitos.map(r => (
                  <li key={r.texto} style={{ color: r.ok ? '#10B981' : 'var(--text-muted)' }}>
                    {r.ok ? '✓' : '○'} {r.texto}
                  </li>
                ))}
              </ul>
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
            Já tem uma conta?{' '}
            <button className="link-btn" onClick={() => navigate('login')}>
              Fazer login
            </button>
          </p>

          <button className="auth-back" onClick={() => navigate('landing')}>
            Voltar ao início
          </button>
        </div>
      </div>
    </div>
  );
}