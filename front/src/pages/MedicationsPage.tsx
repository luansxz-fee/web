import React, { useState } from 'react';
import { useMed } from '../context/MedContext';
import { Medication } from '../types';
import MedModal from '../components/MedModal';

const CATEGORIES = ['Todos', 'Cardiovascular', 'Diabetes', 'Pressão', 'Vitaminas', 'Antibiótico', 'Dor/Febre', 'Digestivo', 'Sono', 'Outros'];

export default function MedicationsPage() {
  const { medications, deleteMedication, toggleMedication } = useMed();
  const [showModal, setShowModal] = useState(false);
  const [editMed, setEditMed] = useState<Medication | undefined>();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [detailMed, setDetailMed] = useState<Medication | null>(null);

  const filtered = medications.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
      (m.prescribedBy || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'Todos' || m.category === category;
    return matchSearch && matchCat;
  });

  const handleEdit = (med: Medication) => { setEditMed(med); setShowModal(true); };
  const handleDelete = (id: string) => { deleteMedication(id); setConfirmDelete(null); };
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleToggle = async (med: Medication) => {
    if (togglingId === med.id) return;

    setTogglingId(med.id);
    try {
      await toggleMedication(med.id);
    } catch {
      // O estado só é alterado após o backend confirmar a operação.
    } finally {
      setTogglingId(null);
    }
  };

  const stockPct = (med: Medication) => {
    const max = med.stockMax || med.stock || 30;
    return Math.min(100, Math.round((med.stock / max) * 100));
  };
  const stockColor = (pct: number) => pct < 20 ? 'var(--danger)' : pct < 50 ? 'var(--warning)' : 'var(--success)';

  return (
    <div className="medications-page">
      <div className="page-header">
        <div>
          <h1>Medicamentos</h1>
          <p>{medications.length} cadastrado{medications.length !== 1 ? 's' : ''} · {medications.filter(m=>m.active).length} ativo{medications.filter(m=>m.active).length !== 1 ? 's' : ''}</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button className={`btn btn--ghost btn--sm ${viewMode==='grid'?'btn--active':''}`} onClick={()=>setViewMode('grid')} title="Grade">⊞</button>
          <button className={`btn btn--ghost btn--sm ${viewMode==='list'?'btn--active':''}`} onClick={()=>setViewMode('list')} title="Lista">☰</button>
          <button className="btn btn--primary" onClick={() => { setEditMed(undefined); setShowModal(true); }}>
            + Novo medicamento
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-box">
          <span>🔍</span>
          <input type="text" placeholder="Buscar por nome ou médico..." value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button onClick={() => setSearch('')}>✕</button>}
        </div>
        <div className="category-tabs">
          {CATEGORIES.map(cat => (
            <button key={cat} className={`tab-btn ${category === cat ? 'tab-btn--active' : ''}`} onClick={() => setCategory(cat)}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid / List */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">💊</div>
          <h3>Nenhum medicamento encontrado</h3>
          <p>{search ? 'Tente outra busca.' : 'Adicione seu primeiro medicamento para começar.'}</p>
          {!search && <button className="btn btn--primary" onClick={() => setShowModal(true)}>+ Adicionar medicamento</button>}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="med-grid">
          {filtered.map(med => {
            const pct = stockPct(med);
            return (
              <div key={med.id} className={`med-card ${!med.active ? 'med-card--inactive' : ''}`}>
                {/* Image or icon area */}
                <div className="med-card__visual" style={{ borderBottom: `3px solid ${med.color}` }}>
                  {med.imageUrl ? (
                    <img
                      src={med.imageUrl} alt={med.name}
                      className="med-card__img"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="med-card__icon-big" style={{ background: med.color + '18', color: med.color }}>
                      {med.icon}
                    </div>
                  )}
                  <div className="med-card__toggle-abs">
                    <button
                      className={`toggle ${med.active ? 'toggle--on' : ''}`}
                      onClick={() => void handleToggle(med)}
                      disabled={togglingId === med.id}
                      aria-pressed={med.active}
                      aria-label={med.active ? `Desativar ${med.name}` : `Ativar ${med.name}`}
                      title={med.active ? 'Desativar' : 'Ativar'}
                    ><span /></button>
                  </div>
                </div>

                <div className="med-card__body">
                  <div className="med-card__badges">
                    <span className="badge badge--neutral">{med.category}</span>
                    {!med.active && <span className="badge badge--muted">Inativo</span>}
                    {med.stock <= 5 && med.active && <span className="badge badge--danger">⚠️ Baixo</span>}
                  </div>
                  <h3 className="med-card__name">{med.name}</h3>
                  <p className="med-card__dosage">{med.dosage} {med.unit} · {med.frequency}</p>
                  {med.prescribedBy && <p className="med-card__doctor">👨‍⚕️ {med.prescribedBy}</p>}

                  <div className="med-card__times">
                    {med.times.map(t => (
                      <span key={t} className="time-chip">{t}</span>
                    ))}
                  </div>

                  {/* Stock bar */}
                  <div className="med-card__stock">
                    <div className="med-card__stock-label">
                      <span>Estoque</span>
                      <span style={{ color: stockColor(pct) }}>{med.stock} un. ({pct}%)</span>
                    </div>
                    <div className="stock-track">
                      <div className="stock-track__fill" style={{ width: `${pct}%`, background: stockColor(pct) }} />
                    </div>
                  </div>
                </div>

                <div className="med-card__actions">
                  <button className="btn btn--ghost btn--sm" onClick={() => setDetailMed(med)}>👁️ Ver</button>
                  <button className="btn btn--outline btn--sm" onClick={() => handleEdit(med)}>✏️ Editar</button>
                  <button className="btn btn--danger-ghost btn--sm" onClick={() => setConfirmDelete(med.id)}>🗑️</button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List view */
        <div className="med-list-view">
          {filtered.map(med => {
            const pct = stockPct(med);
            return (
              <div key={med.id} className={`med-list-item ${!med.active ? 'med-list-item--inactive' : ''}`}>
                <div className="med-list-item__accent" style={{ background: med.color }} />
                {med.imageUrl ? (
                  <img src={med.imageUrl} alt={med.name} className="med-list-item__img"
                    onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
                ) : (
                  <div className="med-list-item__icon" style={{ background: med.color + '22', color: med.color }}>{med.icon}</div>
                )}
                <div className="med-list-item__info">
                  <div className="med-list-item__top">
                    <strong>{med.name}</strong>
                    <span className="badge badge--neutral">{med.category}</span>
                    {!med.active && <span className="badge badge--muted">Inativo</span>}
                  </div>
                  <span className="text-muted">{med.dosage} {med.unit} · {med.frequency} · {med.times.join(', ')}</span>
                  {med.prescribedBy && <span className="text-muted">👨‍⚕️ {med.prescribedBy}</span>}
                </div>
                <div className="med-list-item__stock">
                  <span style={{ color: stockColor(pct), fontSize: 13, fontWeight: 700 }}>{med.stock} un.</span>
                  <div className="stock-track stock-track--sm">
                    <div className="stock-track__fill" style={{ width: `${pct}%`, background: stockColor(pct) }} />
                  </div>
                </div>
                <div className="med-list-item__actions">
                  <button className={`toggle ${med.active ? 'toggle--on' : ''}`} onClick={() => void handleToggle(med)} disabled={togglingId === med.id} aria-pressed={med.active} aria-label={med.active ? `Desativar ${med.name}` : `Ativar ${med.name}`} title={med.active ? 'Desativar' : 'Ativar'}><span /></button>
                  <button className="btn btn--outline btn--xs" onClick={() => handleEdit(med)}>✏️</button>
                  <button className="btn btn--danger-ghost btn--xs" onClick={() => setConfirmDelete(med.id)}>🗑️</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail modal */}
      {detailMed && (
        <div className="modal-overlay" onClick={() => setDetailMed(null)}>
          <div className="modal modal--lg" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <div className="modal__header-inner">
                {detailMed.imageUrl
                  ? <img src={detailMed.imageUrl} alt={detailMed.name} className="modal__header-img" />
                  : <div className="modal__header-icon" style={{ background: detailMed.color+'22', color: detailMed.color }}>{detailMed.icon}</div>
                }
                <h2>{detailMed.name}</h2>
              </div>
              <button className="modal__close" onClick={() => setDetailMed(null)}>✕</button>
            </div>
            <div className="modal__body">
              <div className="detail-grid">
                <div className="detail-row"><span>Dosagem</span><strong>{detailMed.dosage} {detailMed.unit}</strong></div>
                <div className="detail-row"><span>Frequência</span><strong>{detailMed.frequency}</strong></div>
                <div className="detail-row"><span>Categoria</span><strong>{detailMed.category}</strong></div>
                <div className="detail-row"><span>Horários</span><strong>{detailMed.times.join(', ')}</strong></div>
                <div className="detail-row"><span>Início</span><strong>{new Date(detailMed.startDate+'T12:00').toLocaleDateString('pt-BR')}</strong></div>
                {detailMed.endDate && <div className="detail-row"><span>Término</span><strong>{new Date(detailMed.endDate+'T12:00').toLocaleDateString('pt-BR')}</strong></div>}
                {detailMed.prescribedBy && <div className="detail-row"><span>Médico</span><strong>{detailMed.prescribedBy}</strong></div>}
                <div className="detail-row"><span>Estoque</span><strong>{detailMed.stock} unidades</strong></div>
                <div className="detail-row"><span>Lembretes</span><strong>{detailMed.reminderEnabled ? 'Ativados ✓' : 'Desativados'}</strong></div>
                <div className="detail-row"><span>Status</span><strong>{detailMed.active ? '✅ Ativo' : '⏸️ Inativo'}</strong></div>
              </div>
              {detailMed.instructions && (
                <div className="detail-block"><span>📝 Instruções</span><p>{detailMed.instructions}</p></div>
              )}
              {detailMed.sideEffects && (
                <div className="detail-block detail-block--warn"><span>⚠️ Efeitos colaterais</span><p>{detailMed.sideEffects}</p></div>
              )}
            </div>
            <div className="modal__footer">
              <button className="btn btn--ghost" onClick={() => setDetailMed(null)}>Fechar</button>
              <button className="btn btn--primary" onClick={() => { handleEdit(detailMed); setDetailMed(null); }}>✏️ Editar</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal modal--sm" onClick={e => e.stopPropagation()}>
            <div className="modal__header"><h2>🗑️ Excluir medicamento?</h2><button className="modal__close" onClick={()=>setConfirmDelete(null)}>✕</button></div>
            <div className="modal__body">
              <p>Esta ação não pode ser desfeita. Todo o histórico deste medicamento também será removido.</p>
            </div>
            <div className="modal__footer">
              <button className="btn btn--outline" onClick={() => setConfirmDelete(null)}>Cancelar</button>
              <button className="btn btn--danger" onClick={() => handleDelete(confirmDelete)}>Excluir permanentemente</button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <MedModal medication={editMed} onClose={() => { setShowModal(false); setEditMed(undefined); }} />
      )}
    </div>
  );
}
