import React, { useState, useEffect, useRef } from 'react';
import { useMed } from '../context/MedContext';
import { Medication } from '../types';

interface Props {
  medication?: Medication;
  onClose: () => void;
}

const COLORS = ['#2563EB','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#06B6D4','#84CC16'];
const ICONS  = ['💊','💉','🩺','❤️','🧪','🌡️','🩹','🫀','🧠','👁️','🦷','💪'];
const CATEGORIES  = ['Cardiovascular','Diabetes','Pressão','Vitaminas','Antibiótico','Dor/Febre','Digestivo','Sono','Outros'];
const FREQUENCIES = ['Diário','2x ao dia','3x ao dia','A cada 4 horas','A cada 6 horas','A cada 8 horas','A cada 12 horas','Semanal','Quinzenal','Conforme necessário'];
const UNITS = ['mg','mcg','g','ml','comprimido(s)','cápsula(s)','gota(s)','UI','%','dose(s)'];

type ImgStatus = 'empty' | 'loading' | 'ok' | 'error';

export default function MedModal({ medication, onClose }: Props) {
  const { addMedication, updateMedication } = useMed();
  const isEdit = !!medication;

  /* ── form state ── */
  const [name,            setName]            = useState(medication?.name            || '');
  const [dosage,          setDosage]          = useState(medication?.dosage          || '');
  const [unit,            setUnit]            = useState(medication?.unit            || 'mg');
  const [frequency,       setFrequency]       = useState(medication?.frequency       || 'Diário');
  const [times,           setTimes]           = useState<string[]>(medication?.times || ['08:00']);
  const [startDate,       setStartDate]       = useState(medication?.startDate       || new Date().toISOString().split('T')[0]);
  const [endDate,         setEndDate]         = useState(medication?.endDate         || '');
  const [instructions,    setInstructions]    = useState(medication?.instructions    || '');
  const [color,           setColor]           = useState(medication?.color           || COLORS[0]);
  const [icon,            setIcon]            = useState(medication?.icon            || ICONS[0]);
  const [category,        setCategory]        = useState(medication?.category        || 'Outros');
  const [stock,           setStock]           = useState(medication?.stock           ?? 30);
  const [stockMax,        setStockMax]        = useState(medication?.stockMax        ?? 30);
  const [reminderEnabled, setReminderEnabled] = useState(medication?.reminderEnabled ?? true);
  const [prescribedBy,    setPrescribedBy]    = useState(medication?.prescribedBy    || '');
  const [sideEffects,     setSideEffects]     = useState(medication?.sideEffects     || '');

  const [imageUrl,  setImageUrl]  = useState(medication?.imageUrl || '');
  const [imgStatus, setImgStatus] = useState<ImgStatus>(() =>
    medication?.imageUrl ? 'loading' : 'empty'
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step,   setStep]   = useState(1);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const trimmed = imageUrl.trim();
    if (!trimmed) { setImgStatus('empty'); return; }

    setImgStatus('loading');

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const img = new Image();
      img.onload  = () => setImgStatus('ok');
      img.onerror = () => setImgStatus('error');
      img.src     = trimmed;
    }, 600); 

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [imageUrl]);

  /* ── validation ── */
  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim())        e.name   = 'Informe o nome do medicamento.';
    if (!dosage.trim())      e.dosage = 'Informe a dosagem.';
    if (times.some(t => !t)) e.times  = 'Informe todos os horários.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const data = {
      name: name.trim(), dosage: dosage.trim(), unit, frequency, times,
      startDate, endDate: endDate || undefined,
      instructions: instructions.trim() || undefined,
      color, icon, category, stock, stockMax, reminderEnabled, active: true,
      imageUrl: (imgStatus === 'ok' && imageUrl.trim()) ? imageUrl.trim() : undefined,
      prescribedBy: prescribedBy.trim() || undefined,
      sideEffects:  sideEffects.trim()  || undefined,
    };
    if (isEdit && medication) updateMedication(medication.id, data);
    else addMedication(data);
    onClose();
  };

  const addTime    = () => setTimes([...times, '12:00']);
  const removeTime = (i: number) => setTimes(times.filter((_, idx) => idx !== i));
  const updateTime = (i: number, v: string) => setTimes(times.map((t, idx) => idx === i ? v : t));

  const stockPct   = Math.min(100, Math.round((stock / Math.max(1, stockMax)) * 100));
  const stockClr   = stockPct < 20 ? 'var(--danger)' : stockPct < 50 ? 'var(--warning)' : 'var(--success)';

  const STEP_LABELS = ['Básico', 'Horários & Estoque', 'Imagem & Detalhes'];

  const renderImageSection = () => (
    <div className="form-group">
      <label>🖼️ Foto do medicamento (URL)</label>
      <div className="image-url-row">
        <input
          type="url"
          placeholder="https://exemplo.com/remedio.jpg"
          value={imageUrl}
          onChange={e => setImageUrl(e.target.value)}
          autoComplete="off"
        />
        {imageUrl && (
          <button
            type="button"
            className="btn btn--danger-ghost btn--sm"
            onClick={() => { setImageUrl(''); setImgStatus('empty'); }}
          >✕</button>
        )}
      </div>

      <p className="form-hint">
        Cole a URL direta de uma imagem (.jpg, .png, .webp). A pré-visualização carrega automaticamente.
      </p>

      {imgStatus === 'loading' && imageUrl && (
        <div className="img-status img-status--loading">
          <span className="img-spinner" /> Carregando imagem…
        </div>
      )}
      {imgStatus === 'error' && (
        <div className="img-status img-status--error">
          ⚠️ URL inválida ou imagem não carregou. Verifique o endereço.
        </div>
      )}
      {imgStatus === 'ok' && (
        <div className="image-preview">
          <img src={imageUrl} alt="Preview do medicamento" />
          <span className="img-status img-status--ok">✓ Imagem carregada com sucesso</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--lg" onClick={e => e.stopPropagation()}>

        <div className="modal__header">
          <div className="modal__header-inner">
            {imgStatus === 'ok' ? (
              <img src={imageUrl} alt={name} className="modal__header-img" />
            ) : (
              <div className="modal__header-icon" style={{ background: color + '22', color }}>{icon}</div>
            )}
            <div>
              <h2>{isEdit ? 'Editar medicamento' : 'Novo medicamento'}</h2>
              {name && <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>{name}</p>}
            </div>
          </div>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>

        <div className="steps-indicator">
          {[1, 2, 3].map(s => (
            <div key={s} className={`step-dot ${step >= s ? 'step-dot--active' : ''} ${step === s ? 'step-dot--current' : ''}`}>
              <span>{s}</span>
              <label>{STEP_LABELS[s - 1]}</label>
            </div>
          ))}
        </div>

        <div className="modal__body">

          {step === 1 && (
            <div className="modal-step">
              <div className="form-group">
                <label>Nome do medicamento *</label>
                <input
                  type="text" placeholder="Ex: Losartana Potássica 50 mg"
                  value={name} onChange={e => setName(e.target.value)}
                  className={errors.name ? 'input--error' : ''} autoFocus
                />
                {errors.name && <span className="form-error-msg">{errors.name}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Dosagem *</label>
                  <input
                    type="text" placeholder="Ex: 50"
                    value={dosage} onChange={e => setDosage(e.target.value)}
                    className={errors.dosage ? 'input--error' : ''}
                  />
                  {errors.dosage && <span className="form-error-msg">{errors.dosage}</span>}
                </div>
                <div className="form-group">
                  <label>Unidade</label>
                  <select value={unit} onChange={e => setUnit(e.target.value)}>
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Categoria</label>
                  <select value={category} onChange={e => setCategory(e.target.value)}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Médico prescritor (opcional)</label>
                <input type="text" placeholder="Ex: Dra. Ana Souza" value={prescribedBy} onChange={e => setPrescribedBy(e.target.value)} />
              </div>

              <div className="form-group">
                <label>Ícone visual</label>
                <div className="icon-picker">
                  {ICONS.map(ic => (
                    <button key={ic} type="button"
                      className={`icon-option ${icon === ic ? 'icon-option--selected' : ''}`}
                      onClick={() => setIcon(ic)}>{ic}</button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Cor de identificação</label>
                <div className="color-picker">
                  {COLORS.map(c => (
                    <button key={c} type="button"
                      className={`color-option ${color === c ? 'color-option--selected' : ''}`}
                      style={{ background: c }} onClick={() => setColor(c)} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="modal-step">
              <div className="form-group">
                <label>Frequência</label>
                <div className="freq-options">
                  {FREQUENCIES.map(f => (
                    <button key={f} type="button"
                      className={`freq-option ${frequency === f ? 'freq-option--selected' : ''}`}
                      onClick={() => setFrequency(f)}>{f}</button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Horários *</label>
                {times.map((t, i) => (
                  <div key={i} className="time-row">
                    <span className="time-row__label">Dose {i + 1}</span>
                    <input type="time" value={t} onChange={e => updateTime(i, e.target.value)} />
                    {times.length > 1 && (
                      <button type="button" className="btn btn--danger-ghost btn--xs" onClick={() => removeTime(i)}>✕</button>
                    )}
                  </div>
                ))}
                {errors.times && <span className="form-error-msg">{errors.times}</span>}
                <button type="button" className="btn btn--outline btn--sm" style={{ marginTop: 6 }} onClick={addTime}>
                  + Adicionar horário
                </button>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Data de início</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Data de término (opcional)</label>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} min={startDate} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Estoque atual (unidades)</label>
                  <div className="stock-input">
                    <button type="button" className="btn btn--outline btn--sm" onClick={() => setStock(Math.max(0, stock - 1))}>−</button>
                    <input type="number" value={stock} min="0"
                      onChange={e => setStock(Math.max(0, parseInt(e.target.value) || 0))} />
                    <button type="button" className="btn btn--outline btn--sm" onClick={() => setStock(stock + 1)}>+</button>
                  </div>
                </div>
                <div className="form-group">
                  <label>Capacidade da caixa</label>
                  <div className="stock-input">
                    <button type="button" className="btn btn--outline btn--sm" onClick={() => setStockMax(Math.max(1, stockMax - 1))}>−</button>
                    <input type="number" value={stockMax} min="1"
                      onChange={e => setStockMax(Math.max(1, parseInt(e.target.value) || 1))} />
                    <button type="button" className="btn btn--outline btn--sm" onClick={() => setStockMax(stockMax + 1)}>+</button>
                  </div>
                </div>
              </div>

              <div className="stock-bar-preview">
                <div className="stock-bar-preview__label">
                  <span>Nível de estoque: {stock} / {stockMax} unidades</span>
                  <span style={{ color: stockClr, fontWeight: 700 }}>{stockPct}%</span>
                </div>
                <div className="stock-bar-preview__track">
                  <div className="stock-bar-preview__fill" style={{ width: `${stockPct}%`, background: stockClr }} />
                </div>
                {stockPct < 20 && stock > 0 && (
                  <p className="form-warn">⚠️ Estoque crítico! Lembre-se de repor.</p>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="modal-step">

              {renderImageSection()}

              <div className="form-group">
                <label>Instruções de uso (opcional)</label>
                <textarea
                  placeholder="Ex: Tomar com água em jejum, evitar laticínios…"
                  value={instructions} onChange={e => setInstructions(e.target.value)} rows={3} />
              </div>

              <div className="form-group">
                <label>Efeitos colaterais conhecidos (opcional)</label>
                <textarea
                  placeholder="Ex: Tontura, náusea leve, sensibilidade solar…"
                  value={sideEffects} onChange={e => setSideEffects(e.target.value)} rows={2} />
              </div>

              <div className="form-group">
                <label className="toggle-label">
                  <span>🔔 Lembretes ativados</span>
                  <button type="button"
                    className={`toggle ${reminderEnabled ? 'toggle--on' : ''}`}
                    onClick={() => setReminderEnabled(!reminderEnabled)}>
                    <span />
                  </button>
                </label>
                <p className="form-hint">Receba alertas nos horários configurados.</p>
              </div>

              <div className="med-preview-card">
                <div className="med-preview-card__accent" style={{ background: color }} />
                {imgStatus === 'ok' ? (
                  <img src={imageUrl} alt={name} className="med-preview-card__img" />
                ) : (
                  <div className="med-preview-card__icon" style={{ background: color + '22', color }}>{icon}</div>
                )}
                <div className="med-preview-card__info">
                  <strong>{name || 'Nome do medicamento'}</strong>
                  <span>{dosage} {unit} · {frequency}</span>
                  <span>{times.join(', ')} · {category}</span>
                  {prescribedBy && <span>👨‍⚕️ {prescribedBy}</span>}
                </div>
                <div className="med-preview-card__stock">
                  <span style={{ color: stockClr, fontWeight: 700 }}>📦 {stock} un.</span>
                  <div className="stock-track" style={{ width: 60, marginTop: 4 }}>
                    <div className="stock-track__fill" style={{ width: `${stockPct}%`, background: stockClr }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal__footer">
          <button className="btn btn--ghost"
            onClick={step === 1 ? onClose : () => setStep(step - 1)}>
            {step === 1 ? 'Cancelar' : '← Voltar'}
          </button>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="step-counter">{step} de 3</span>
            {step < 3 ? (
              <button className="btn btn--primary" onClick={() => {
                if (step === 1 && !validate()) return;
                setStep(step + 1);
              }}>Próximo →</button>
            ) : (
              <button className="btn btn--primary" onClick={handleSubmit}>
                {isEdit ? '✓ Salvar alterações' : '✓ Adicionar medicamento'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
