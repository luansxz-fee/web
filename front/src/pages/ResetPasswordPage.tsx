import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Page } from '../components/AppRouter';
import Logo from '../components/Logo';

interface Props { navigate: (p: Page) => void; token: string; }

export default function ResetPasswordPage({ navigate, token }: Props) {
  const { redefinirSenha } = useAuth();
  const [codigoInput, setCodigoInput] = useState(token || '');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [concluido, setConcluido] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoInput || !novaSenha) { setErro('Preencha todos os campos.'); return; }
    if (novaSenha !== confirmarSenha) { setErro('As senhas nao coincidem.'); return; }
    if (novaSenha.length < 6) { setErro('A senha deve ter pelo menos 6 caracteres.'); return; }
    setCarregando(true);
    setErro('');
    const ok = await redefinirSenha(codigoInput.toUpperCase(), novaSenha);
    setCarregando(false);
    if (ok) setConcluido(true);
    else setErro('Codigo invalido ou expirado. Solicite um novo codigo.');
  };

  return (
    <div className="auth-page auth-page--centered">
      <div className="auth-form-wrap auth-form-wrap--centered">
        <div style={{ marginBottom: 32 }}><Logo size="md" /></div>

        {!concluido ? (
          <>
            <div className="auth-form__header">
              <h1>Nova senha</h1>
              <p>Informe o codigo recebido por e-mail e defina sua nova senha.</p>
            </div>
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Codigo de recuperacao</label>
                <input
                  type="text"
                  placeholder="Cole o codigo recebido"
                  value={codigoInput}
                  onChange={e => setCodigoInput(e.target.value.toUpperCase())}
                  style={{ fontFamily: 'monospace', letterSpacing: '0.15em' }}
                />
              </div>
              <div className="form-group">
                <label>Nova senha</label>
                <div className="input-wrap">
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    placeholder="Minimo 6 caracteres"
                    value={novaSenha}
                    onChange={e => setNovaSenha(e.target.value)}
                  />
                  <button type="button" className="input-eye" onClick={() => setMostrarSenha(!mostrarSenha)}>
                    {mostrarSenha ? '🔓' : '🔒'}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Confirmar nova senha</label>
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  placeholder="Repita a nova senha"
                  value={confirmarSenha}
                  onChange={e => setConfirmarSenha(e.target.value)}
                />
              </div>
              {erro && <div className="form-error">{erro}</div>}
              <button
                type="submit"
                className={`btn btn--primary btn--block ${carregando ? 'btn--loading' : ''}`}
                disabled={carregando}
              >
                {carregando ? 'Salvando...' : 'Redefinir senha'}
              </button>
            </form>
          </>
        ) : (
          <div className="auth-success">
            <div className="auth-success__icon">✅</div>
            <h2>Senha redefinida!</h2>
            <p>Sua senha foi alterada com sucesso. Faca login com a nova senha.</p>
            <button className="btn btn--primary" onClick={() => navigate('login')}>
              Ir para o login
            </button>
          </div>
        )}

        <button className="auth-back" onClick={() => navigate('login')}>
          Voltar ao login
        </button>
      </div>
    </div>
  );
}
