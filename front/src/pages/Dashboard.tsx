import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMed } from '../context/MedContext';
import { Page } from '../components/AppRouter';
import MedModal from '../components/MedModal';

interface Props { navigate: (p: Page) => void; }

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function Dashboard({ navigate }: Props) {
  const { user } = useAuth();
  const { getTodayMedications, getAdherenceRate, medications, logs, logDose } = useMed();
  const [showAddModal, setShowAddModal] = useState(false);
  const [noteModal, setNoteModal] = useState<{id: string; time: string} | null>(null);
  const [noteText, setNoteText] = useState('');

  const today = getTodayMedications();

  // Verifica se o horário agendado já venceu
  const isTimePassed = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const scheduledMinutes = h * 60 + m;
    return currentMinutes > scheduledMinutes;
  };

  // 🚨 AUTO-REGISTRO DE DOSES PERDIDAS
  // Sempre que o horário passar sem ação do usuário, salva automaticamente como 'missed' (PERDIDO)
  useEffect(() => {
    const checkMissedDoses = () => {
      today.forEach(({ medication, log, scheduledTime }) => {
        if (!log && isTimePassed(scheduledTime)) {
          logDose(medication.id, scheduledTime, 'missed');
        }
      });
    };

    checkMissedDoses();
    const interval = setInterval(checkMissedDoses, 30000); // Executa a cada 30 segundos
    return () => clearInterval(interval);
  }, [today, logDose]);

  const adherence7 = getAdherenceRate(7);
  const adherence30 = getAdherenceRate(30);

  // Define o status real da dose
  const getDoseStatus = (log: any, scheduledTime: string) => {
    if (log?.status === 'taken') return 'taken';
    if (log?.status === 'skipped') return 'skipped';
    if (log?.status === 'missed') return 'missed';
    if (isTimePassed(scheduledTime)) return 'missed';
    return 'pending';
  };

  // Doses pendentes do dia (só exibe as que ainda NÃO venceram)
  const upcoming = today.filter(({ log, scheduledTime }) => getDoseStatus(log, scheduledTime) === 'pending');

  const todayTaken = today.filter(t => getDoseStatus(t.log, t.scheduledTime) === 'taken').length;
  const todayTotal = today.length;
  
  const activeMeds = medications.filter(m => m.active).length;
  const lowStock = medications.filter(m => m.active && m.stock <= 5).length;

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); 
    d.setDate(d.getDate() - 6 + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayLogs = logs.filter(l => l.date === dateStr);
    const taken = dayLogs.filter(l => l.status === 'taken').length;
    const total = dayLogs.length;
    const pct = total > 0 ? Math.round((taken / total) * 100) : -1;
    return { label: DAYS[d.getDay()], isToday: i === 6, pct, dateStr };
  });

  const handleLogWithNote = () => {
    if (!noteModal) return;
    logDose(noteModal.id, noteModal.time, 'taken', noteText);
    setNoteModal(null);
    setNoteText('');
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard__header">
        <div>
          <h1>{greeting}, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="dashboard__date">
            {now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button className="btn btn--primary" onClick={() => setShowAddModal(true)}>
          + Adicionar medicamento
        </button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="stats-row">
        <div className="stat-card stat-card--blue">
          <div className="stat-card__icon">💊</div>
          <div className="stat-card__value">{todayTaken}/{todayTotal}</div>
          <div className="stat-card__label">Doses hoje</div>
          {todayTotal > 0 && (
            <div className="stat-card__bar">
              <div className="stat-card__bar-fill" style={{ width: `${(todayTaken/todayTotal)*100}%`, background:'#fff' }} />
            </div>
          )}
        </div>

        <div className={`stat-card ${adherence7 < 50 ? 'stat-card--orange' : 'stat-card--green'}`}>
          <div className="stat-card__icon">📈</div>
          <div className="stat-card__value">{adherence7}%</div>
          <div className="stat-card__label">Adesão 7 dias</div>
          <div className="stat-card__bar">
            <div className="stat-card__bar-fill" style={{ width:`${adherence7}%`, background:'#fff' }} />
          </div>
        </div>

        <div className="stat-card stat-card--purple">
          <div className="stat-card__icon">🗂️</div>
          <div className="stat-card__value">{activeMeds}</div>
          <div className="stat-card__label">Medicamentos ativos</div>
        </div>

        <div className={`stat-card ${lowStock > 0 ? 'stat-card--orange' : 'stat-card--teal'}`}>
          <div className="stat-card__icon">{lowStock > 0 ? '⚠️' : '✅'}</div>
          <div className="stat-card__value">{lowStock > 0 ? lowStock : adherence30 + '%'}</div>
          <div className="stat-card__label">{lowStock > 0 ? 'Estoque baixo' : 'Adesão 30 dias'}</div>
        </div>
      </div>

      <div className="dashboard__grid">
        {/* Lista Principal de Medicamentos de Hoje */}
        <div className="card">
          <div className="card__header">
            <h2>Medicamentos de hoje</h2>
            <button className="btn btn--ghost btn--sm" onClick={() => navigate('medications')}>Ver todos →</button>
          </div>
          {today.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">💊</div>
              <p>Nenhum medicamento ativo para hoje.</p>
              <button className="btn btn--outline btn--sm" onClick={() => setShowAddModal(true)}>+ Adicionar agora</button>
            </div>
          ) : (
            <div className="med-list">
              {today.map(({ medication, log, scheduledTime }) => {
                const status = getDoseStatus(log, scheduledTime);

                return (
                  <div key={`${medication.id}-${scheduledTime}`} className={`med-item ${status === 'taken' ? 'med-item--taken' : ''}`}>
                    {medication.imageUrl ? (
                      <img src={medication.imageUrl} alt={medication.name} className="med-item__img"
                        onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
                    ) : (
                      <div className="med-item__color" style={{ background: medication.color }} />
                    )}
                    <div className="med-item__info">
                      <span className="med-item__name">{medication.name}</span>
                      <span className="med-item__detail">{medication.dosage} {medication.unit} • {scheduledTime}</span>
                      {log?.notes && <span className="med-item__note">💬 {log.notes}</span>}
                    </div>
                    <div className="med-item__actions">
                      {status === 'taken' ? (
                        <span className="badge badge--success">✓ Tomado</span>
                      ) : status === 'skipped' ? (
                        <span className="badge badge--warning">— Pulado</span>
                      ) : status === 'missed' ? (
                        <span className="badge badge--danger">✕ Perdido</span>
                      ) : (
                        <div className="med-item__btn-group">
                          <button className="btn btn--success btn--xs" onClick={() => setNoteModal({ id: medication.id, time: scheduledTime })}>✓ Tomar</button>
                          <button className="btn btn--ghost btn--xs" onClick={() => logDose(medication.id, scheduledTime, 'skipped')}>Pular</button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Coluna Direita */}
        <div className="dashboard__right">
          {/* Próximas Doses */}
          <div className="card">
            <div className="card__header"><h2>Próximas doses</h2></div>
            {upcoming.length === 0 ? (
              <p className="text-muted" style={{ fontSize: 13 }}>Nenhuma dose pendente para hoje. 🎉</p>
            ) : (
              <div className="upcoming-list">
                {upcoming.map(({ medication, scheduledTime }, i) => (
                  <div key={i} className="upcoming-item">
                    {medication.imageUrl ? (
                      <img src={medication.imageUrl} alt={medication.name} className="upcoming-item__img"
                        onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
                    ) : (
                      <div className="upcoming-item__dot" style={{ background: medication.color }} />
                    )}
                    <div className="upcoming-item__info">
                      <span>{medication.name}</span>
                      <span className="text-muted">{medication.dosage} {medication.unit}</span>
                    </div>
                    <span className="upcoming-item__time">{scheduledTime}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Adesão da Semana */}
          <div className="card">
            <div className="card__header"><h2>Adesão da semana</h2></div>
            <div className="week-overview">
              {weekDays.map((day, i) => (
                <div key={i} className={`week-day ${day.isToday ? 'week-day--today' : ''}`}>
                  <span className="week-day__label">{day.label}</span>
                  <div
                    className="week-day__dot"
                    style={{
                      background: day.pct < 0 ? 'var(--border)' : day.pct >= 80 ? 'var(--success)' : day.pct >= 50 ? 'var(--warning)' : 'var(--danger)',
                      opacity: day.pct < 0 ? 0.3 : 1,
                    }}
                    title={day.pct >= 0 ? `${day.pct}%` : 'Sem dados'}
                  />
                  {day.pct >= 0 && <span className="week-day__pct">{day.pct}%</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Resumo Geral */}
          <div className="card">
            <div className="card__header"><h2>Resumo geral</h2></div>
            <div className="quick-stats">
              <div className="quick-stat">
                <span>Total de registros</span>
                <strong>{logs.length}</strong>
              </div>
              <div className="quick-stat">
                <span>Doses tomadas</span>
                <strong style={{ color: 'var(--success)' }}>
                  {logs.filter(l => l.status === 'taken').length}
                </strong>
              </div>
              <div className="quick-stat">
                <span>Doses puladas</span>
                <strong style={{ color: 'var(--warning, #f59e0b)' }}>
                  {logs.filter(l => l.status === 'skipped').length}
                </strong>
              </div>
              <div className="quick-stat">
                <span>Doses perdidas</span>
                <strong style={{ color: 'var(--danger)' }}>
                  {logs.filter(l => l.status === 'missed').length}
                </strong>
              </div>
              <div className="quick-stat">
                <span>Adesão 30 dias</span>
                <strong style={{ color: 'var(--brand)' }}>{adherence30}%</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Tomar Dose */}
      {noteModal && (
        <div className="modal-overlay" onClick={() => setNoteModal(null)}>
          <div className="modal modal--sm" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h2>✓ Registrar dose</h2>
              <button className="modal__close" onClick={() => setNoteModal(null)}>✕</button>
            </div>
            <div className="modal__body">
              <div className="form-group">
                <label>Observação (opcional)</label>
                <textarea
                  placeholder="Ex: Tomei com leite, senti tontura leve..."
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  rows={3}
                  autoFocus
                />
              </div>
            </div>
            <div className="modal__footer">
              <button className="btn btn--ghost" onClick={() => { logDose(noteModal.id, noteModal.time, 'taken'); setNoteModal(null); setNoteText(''); }}>
                Registrar sem nota
              </button>
              <button className="btn btn--success" onClick={handleLogWithNote}>
                ✓ Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && <MedModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}