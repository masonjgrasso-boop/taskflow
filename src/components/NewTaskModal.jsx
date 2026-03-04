import { useState, useEffect, useRef } from 'react';

export default function NewTaskModal({ onClose, onCreateTask }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const titleRef = useRef(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    await onCreateTask(title.trim(), date || null, description.trim());
    setSaving(false);
    onClose();
  }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
        padding: 16,
      }}
    >
      <div style={{
        background: '#fff',
        borderRadius: 12,
        padding: 28,
        width: '100%',
        maxWidth: 440,
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
      }}>
        <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700, color: '#111827' }}>New Task</h2>
        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Title *</label>
          <input
            ref={titleRef}
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            required
            style={inputStyle}
          />

          <label style={labelStyle}>Due Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={inputStyle}
          />

          <label style={labelStyle}>Notes</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Add notes (optional)"
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' }}
          />

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" onClick={onClose} style={cancelBtnStyle}>Cancel</button>
            <button type="submit" disabled={saving || !title.trim()} style={submitBtnStyle}>
              {saving ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: 4,
  marginTop: 14,
};

const inputStyle = {
  width: '100%',
  fontSize: 14,
  border: '1px solid #e5e7eb',
  borderRadius: 6,
  padding: '8px 10px',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  color: '#1f2937',
};

const cancelBtnStyle = {
  background: '#f3f4f6',
  border: 'none',
  borderRadius: 6,
  padding: '8px 16px',
  cursor: 'pointer',
  fontSize: 14,
  color: '#374151',
};

const submitBtnStyle = {
  background: '#4f46e5',
  border: 'none',
  borderRadius: 6,
  padding: '8px 20px',
  cursor: 'pointer',
  fontSize: 14,
  color: '#fff',
  fontWeight: 600,
};
