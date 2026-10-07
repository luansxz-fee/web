import React from 'react';
import { Page } from '../components/AppRouter';
import { useTheme } from '../context/ThemeContext';
import Logo from '../components/Logo';

interface Props { navigate: (p: Page) => void; }

export default function LandingPage({ navigate }: Props) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="landing">
      <nav className="landing-nav">
        <Logo size="md" />
        <div className="landing-nav__links">
          <a href="#features">Recursos</a>
          <a href="#how">Como funciona</a>
          <button className="btn btn--ghost" onClick={toggleTheme}>{theme === 'light' ? '🌙' : '☀️'}</button>
          <button className="btn btn--outline" onClick={() => navigate('login')}>Entrar</button>
          <button className="btn btn--primary" onClick={() => navigate('register')}>Começar grátis</button>
        </div>
        <button className="landing-nav__mobile-menu" onClick={() => navigate('login')}>Entrar</button>
      </nav>

      <section className="landing-hero">
        <div className="landing-hero__content">
          <div className="landing-hero__badge">🏥 Saúde digital simplificada</div>
          <h1 className="landing-hero__title">
            Controle seus<br/>
            <span className="gradient-text">medicamentos</span><br/>
            com facilidade
          </h1>
          <p className="landing-hero__subtitle">
            O MedSync organiza sua rotina de medicamentos, envia lembretes inteligentes e mantém um histórico completo da sua saúde. Simples, bonito e confiável.
          </p>
          <div className="landing-hero__actions">
            <button className="btn btn--primary btn--lg" onClick={() => navigate('register')}>
              Começar gratuitamente →
            </button>
            <button className="btn btn--outline btn--lg" onClick={() => navigate('login')}>
              Já tenho conta
            </button>
          </div>
          <div className="landing-hero__stats">
            <div className="stat"><strong>98%</strong><span>de adesão média</span></div>
            <div className="stat-divider" />
            <div className="stat"><strong>50k+</strong><span>usuários ativos</span></div>
            <div className="stat-divider" />
            <div className="stat"><strong>4.9★</strong><span>avaliação</span></div>
          </div>
        </div>
        <div className="landing-hero__visual">
          <div className="phone-mockup">
            <div className="phone-mockup__screen">
              <div className="phone-mockup__header">
                <span>Bom dia, Ana 👋</span>
                <div className="phone-mockup__badge">3 doses hoje</div>
              </div>
              {[
                { name: 'Losartana 50mg', time: '08:00', color: '#2563EB', done: true },
                { name: 'Metformina 850mg', time: '12:00', color: '#10B981', done: true },
                { name: 'Atorvastatina', time: '22:00', color: '#F59E0B', done: false },
              ].map((med, i) => (
                <div key={i} className={`phone-mockup__med ${med.done ? 'done' : ''}`}>
                  <div className="phone-mockup__med-dot" style={{ background: med.color }} />
                  <div className="phone-mockup__med-info">
                    <span>{med.name}</span>
                    <span>{med.time}</span>
                  </div>
                  <div className={`phone-mockup__check ${med.done ? 'checked' : ''}`}>
                    {med.done ? '✓' : '○'}
                  </div>
                </div>
              ))}
              <div className="phone-mockup__chart">
                <div className="phone-mockup__chart-label">Adesão semanal</div>
                <div className="phone-mockup__bars">
                  {[70, 100, 85, 100, 100, 70, 90].map((h, i) => (
                    <div key={i} className="phone-mockup__bar-wrap">
                      <div className="phone-mockup__bar" style={{ height: `${h * 0.5}px` }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="hero-float hero-float--1">💊 Lembrete enviado!</div>
          <div className="hero-float hero-float--2">✅ Dose registrada</div>
        </div>
      </section>

      <section id="features" className="landing-section">
        <div className="section-label">Recursos</div>
        <h2 className="section-title">Tudo que você precisa para<br/>cuidar da sua saúde</h2>
        <div className="features-grid">
          {[
            { icon: '🔔', title: 'Lembretes inteligentes', desc: 'Notificações personalizadas para nunca mais esquecer uma dose. Configure horários, dias e frequências.' },
            { icon: '📊', title: 'Histórico completo', desc: 'Acompanhe sua adesão ao tratamento com relatórios detalhados e gráficos de evolução.' },
            { icon: '💊', title: 'Gestão de estoque', desc: 'Controle a quantidade de medicamentos e receba alertas quando estiver acabando.' },
            { icon: '🌙', title: 'Tema escuro', desc: 'Interface adaptável ao seu ambiente. Alterne entre claro e escuro com um toque.' },
            { icon: '🔒', title: 'Privacidade total', desc: 'Seus dados ficam seguros e criptografados. Você tem controle total sobre suas informações.' },
            { icon: '📱', title: 'Qualquer dispositivo', desc: 'Funciona perfeitamente no celular, tablet e computador. Sempre sincronizado.' },
          ].map((f, i) => (
            <div key={i} className="feature-card">
              <div className="feature-card__icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="landing-section landing-section--alt">
        <div className="section-label">Como funciona</div>
        <h2 className="section-title">Comece em 3 passos simples</h2>
        <div className="steps-grid">
          {[
            { n: '01', title: 'Crie sua conta', desc: 'Cadastre-se gratuitamente em segundos. Sem cartão de crédito.' },
            { n: '02', title: 'Adicione seus medicamentos', desc: 'Informe nome, dosagem, horários e frequência de cada medicamento.' },
            { n: '03', title: 'Receba lembretes', desc: 'O MedSync cuida do resto. Você recebe alertas e registra cada dose.' },
          ].map((s, i) => (
            <div key={i} className="step-card">
              <div className="step-card__number">{s.n}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-cta">
        <h2>Comece a cuidar da sua saúde hoje</h2>
        <p>Junte-se a milhares de pessoas que já confiam no MedSync</p>
        <button className="btn btn--primary btn--lg" onClick={() => navigate('register')}>
          Criar conta gratuita →
        </button>
      </section>

      <footer className="landing-footer">
        <Logo size="sm" />
        <p>© 2025 MedSync. Feito com cuidado para sua saúde.</p>
        <div className="landing-footer__links">
          <a href="#">Privacidade</a>
          <a href="#">Termos</a>
          <a href="#">Contato</a>
        </div>
      </footer>
    </div>
  );
}
