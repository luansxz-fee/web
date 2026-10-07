import React, { useState, useMemo } from 'react';
import { useMed } from '../context/MedContext';

export default function HistoryPage() {
  const { logs, medications, getAdherenceRate } = useMed();
  const [daysFilter, setDaysFilter] = useState(7);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const adherence7  = getAdherenceRate(7);
  const adherence30 = getAdherenceRate(30);

  const filteredLogs = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysFilter);
    return logs
      .filter(l => {
        const dateOk   = new Date(l.date) >= cutoff;
        const statusOk = statusFilter === 'all' || l.status === statusFilter;
        return dateOk && statusOk;
      })
      .sort((a, b) => b.date.localeCompare(a.date) || b.scheduledTime.localeCompare(a.scheduledTime));
  }, [logs, daysFilter, statusFilter]);

  const byDate = useMemo(() => {
    const map: Record<string, typeof filteredLogs> = {};
    filteredLogs.forEach(l => { (map[l.date] = map[l.date] || []).push(l); });
    return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filteredLogs]);

  const stats = useMemo(() => {
    const taken   = filteredLogs.filter(l => l.status === 'taken').length;
    const missed  = filteredLogs.filter(l => l.status === 'missed').length;
    const skipped = filteredLogs.filter(l => l.status === 'skipped').length;
    return { taken, missed, skipped, total: filteredLogs.length };
  }, [filteredLogs]);

  const getMed     = (id: string) => medications.find(m => m.id === id);
  const getMedName = (id: string) => getMed(id)?.name || 'Medicamento removido';
  const getMedColor= (id: string) => getMed(id)?.color || '#6B7280';
  const getMedImg  = (id: string) => getMed(id)?.imageUrl;

  const formatDate = (dateStr: string) => {
    const today  = new Date().toISOString().split('T')[0];
    const yday   = new Date(); yday.setDate(yday.getDate() - 1);
    const ydayStr= yday.toISOString().split('T')[0];
    if (dateStr === today)   return 'Hoje';
    if (dateStr === ydayStr) return 'Ontem';
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const statusLabel: Record<string, string> = {
    taken: '✓ Tomado', missed: '✕ Perdido', skipped: '— Pulado', pending: '⏳ Pendente'
  };
  const statusBadge: Record<string, string> = {
    taken: 'badge--success', missed: 'badge--danger', skipped: 'badge--warning', pending: 'badge--muted'
  };

  const adherenceColor = (pct: number) =>
    pct >= 80 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--danger)';

  return (
    <div className="history-page">
      <div className="page-header">
        <div>
          <h1>Histórico</h1>
          <p>Acompanhe sua adesão ao tratamento</p>
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <div className="filter-tabs">
            {[7, 14, 30, 90].map(d => (
              <button key={d} className={`tab-btn ${daysFilter === d ? 'tab-btn--active' : ''}`} onClick={() => setDaysFilter(d)}>
                {d}d
              </button>
            ))}
          </div>
          <div className="filter-tabs">
            {[['all','Todos'],['taken','✓'],['missed','✕'],['skipped','—']].map(([v,l]) => (
              <button key={v} className={`tab-btn ${statusFilter === v ? 'tab-btn--active' : ''}`} onClick={() => setStatusFilter(v)}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="history-stats-row">
        <div className="history-stat-card" style={{ borderTop: `3px solid ${adherenceColor(adherence7)}` }}>
          <div className="history-stat-card__ring" style={{ '--pct': adherence7 } as React.CSSProperties}>
            <svg viewBox="0 0 56 56" width="80" height="80">
              <circle cx="28" cy="28" r="24" fill="none" stroke="var(--border)" strokeWidth="5"/>
              <circle cx="28" cy="28" r="24" fill="none"
                stroke={adherenceColor(adherence7)} strokeWidth="5"
                strokeDasharray={`${adherence7 * 1.508} 150.8`}
                strokeLinecap="round"
                transform="rotate(-90 28 28)"
                style={{ transition:'stroke-dasharray 0.6s ease' }}
              />
              <text x="28" y="33" textAnchor="middle" fontSize="11" fontWeight="800" fill="currentColor">{adherence7}%</text>
            </svg>
          </div>
          <span>Adesão 7 dias</span>
        </div>

        <div className="history-stat-card" style={{ borderTop: `3px solid ${adherenceColor(adherence30)}` }}>
          <div className="history-stat-card__ring">
            <svg viewBox="0 0 56 56" width="80" height="80">
              <circle cx="28" cy="28" r="24" fill="none" stroke="var(--border)" strokeWidth="5"/>
              <circle cx="28" cy="28" r="24" fill="none"
                stroke={adherenceColor(adherence30)} strokeWidth="5"
                strokeDasharray={`${adherence30 * 1.508} 150.8`}
                strokeLinecap="round"
                transform="rotate(-90 28 28)"
                style={{ transition:'stroke-dasharray 0.6s ease' }}
              />
              <text x="28" y="33" textAnchor="middle" fontSize="11" fontWeight="800" fill="currentColor">{adherence30}%</text>
            </svg>
          </div>
          <span>Adesão 30 dias</span>
        </div>

        <div className="history-counters">
          <div className="history-counter history-counter--green">
            <strong>{stats.taken}</strong><span>Tomadas</span>
          </div>
          <div className="history-counter history-counter--red">
            <strong>{stats.missed}</strong><span>Perdidas</span>
          </div>
          <div className="history-counter history-counter--yellow">
            <strong>{stats.skipped}</strong><span>Puladas</span>
          </div>
          <div className="history-counter history-counter--gray">
            <strong>{stats.total}</strong><span>Total</span>
          </div>
        </div>
      </div>

      {/* Log list */}
      {byDate.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">📋</div>
          <h3>Nenhum registro encontrado</h3>
          <p>Registre doses no painel para ver o histórico aqui.</p>
        </div>
      ) : (
        <div className="history-list">
          {byDate.map(([date, dayLogs]) => {
            const taken = dayLogs.filter(l => l.status === 'taken').length;
            const pct   = Math.round((taken / dayLogs.length) * 100);
            return (
              <div key={date} className="history-day">
                <div className="history-day__header">
                  <span className="history-day__date">{formatDate(date)}</span>
                  <div className="history-day__right">
                    <div className="history-day__bar">
                      <div className="history-day__bar-fill"
                        style={{ width:`${pct}%`, background: adherenceColor(pct) }} />
                    </div>
                    <span className="history-day__pct" style={{ color: adherenceColor(pct) }}>
                      {taken}/{dayLogs.length}
                    </span>
                  </div>
                </div>

                <div className="history-day__logs">
                  {dayLogs.map(log => {
                    const img = getMedImg(log.medicationId);
                    return (
                      <div key={log.id} className={`history-log history-log--${log.status}`}>
                        {img ? (
                          <img src={img} alt="" className="history-log__img"
                            onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
                        ) : (
                          <div className="history-log__dot" style={{ background: getMedColor(log.medicationId) }} />
                        )}
                        <div className="history-log__info">
                          <span className="history-log__name">{getMedName(log.medicationId)}</span>
                          <div className="history-log__meta">
                            <span>⏰ {log.scheduledTime}</span>
                            {log.takenAt && (
                              <span>✓ {new Date(log.takenAt).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</span>
                            )}
                            {log.notes && <span>💬 {log.notes}</span>}
                          </div>
                        </div>
                        <span className={`badge ${statusBadge[log.status]}`}>{statusLabel[log.status]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
