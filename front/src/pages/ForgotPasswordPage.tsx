import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Page } from '../components/AppRouter';
import Logo from '../components/Logo';

interface Props { navigate: (p: Page, token?: string) => void; }

export default function ForgotPasswordPage({ navigate }: Props) {
  const { solicitarRecuperacaoSenha } = useAuth();
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [tokenDev, setTokenDev] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setErro('Informe seu e-mail.'); return; }
    setCarregando(true);
    setErro('');
    const res = await solicitarRecuperacaoSenha(email.trim());
    setCarregando(false);
    if (res.ok) {
      setTokenDev(res.tokenDesenvolvimento || '');
      setEnviado(true);
    } else {
      setErro('Nao foi possivel processar sua solicitacao. Tente novamente.');
    }
  };

  return (
    <div className="auth-page auth-page--centered">
      <div className="auth-form-wrap auth-form-wrap--centered">
        <div style={{ marginBottom: 32 }}><Logo size="md" /></div>

        {!enviado ? (
          <>
            <div className="auth-form__header">
              <h1>Esqueceu a senha?</h1>
              <p>Informe seu e-mail e enviaremos um codigo de recuperacao para sua caixa de entrada.</p>
            </div>
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>E-mail cadastrado</label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoFocus
                  autoComplete="email"
                />
              </div>
              {erro && <div className="form-error">{erro}</div>}
              <button
                type="submit"
                className={`btn btn--primary btn--block ${carregando ? 'btn--loading' : ''}`}
                disabled={carregando}
              >
                {carregando ? 'Enviando...' : 'Enviar codigo por e-mail'}
              </button>
            </form>
          </>
        ) : (
          <div className="auth-success">
            <div className="auth-success__icon">📬</div>
            <h2>Codigo enviado!</h2>
            <p>Verifique a caixa de entrada de <strong>{email}</strong> e use o codigo recebido para criar uma nova senha.</p>
            <p className="form-hint" style={{ marginTop: 4 }}>Nao encontrou? Verifique tambem a pasta de spam.</p>

            {tokenDev && (
              <div className="demo-token">
                <div className="demo-token__label">
                  O e-mail nao foi enviado pois o SMTP nao esta configurado no .env. Use este codigo para testar:
                </div>
                <div className="demo-token__value">{tokenDev}</div>
                <button
                  className="btn btn--primary btn--sm"
                  onClick={() => navigate('reset-password', tokenDev)}
                >
                  Usar este codigo
                </button>
              </div>
            )}

            <button
              className="btn btn--outline btn--sm"
              style={{ marginTop: 12 }}
              onClick={() => navigate('reset-password')}
            >
              Ja tenho o codigo
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
