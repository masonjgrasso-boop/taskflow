import { useState, useEffect, useRef } from 'react';

export default function TaskDetail({
  task,
  onUpdateTask,
  onDeleteTask,
  onAddChecklistItem,
  onToggleChecklistItem,
  onDeleteChecklistItem,
  onUpdateChecklistItem,
}) {
  const [editingField, setEditingField] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [newItemText, setNewItemText] = useState('');
  const [editingChecklistId, setEditingChecklistId] = useState(null);
  const [editingChecklistText, setEditingChecklistText] = useState('');
  const newItemRef = useRef(null);

  // Reset edit state when task changes
  useEffect(() => {
    setEditingField(null);
    setEditValues({});
    setNewItemText('');
    setEditingChecklistId(null);
  }, [task?.id]);

  if (!task) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <p style={{ fontSize: 15 }}>Select a task to view details</p>
        </div>
      </div>
    );
  }

  function startEdit(field) {
    setEditingField(field);
    setEditValues(v => ({ ...v, [field]: task[field] ?? '' }));
  }

  function saveEdit(field) {
    const val = editValues[field] ?? '';
    if (val !== (task[field] ?? '')) {
      onUpdateTask(task.id, { [field]: val || null });
    }
    setEditingField(null);
  }

  function cancelEdit() {
    setEditingField(null);
    setEditValues({});
  }

  function handleKeyDown(e, field) {
    if (e.key === 'Enter' && field !== 'description') {
      e.preventDefault();
      saveEdit(field);
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  }

  async function handleAddChecklistItem() {
    const text = newItemText.trim();
    if (!text) return;
    setNewItemText('');
    await onAddChecklistItem(task.id, text);
  }

  function startEditChecklist(item) {
    setEditingChecklistId(item.id);
    setEditingChecklistText(item.text);
  }

  function saveEditChecklist(item) {
    const text = editingChecklistText.trim();
    if (text && text !== item.text) {
      onUpdateChecklistItem(task.id, item.id, text);
    }
    setEditingChecklistId(null);
  }

  const checklist = task.checklist_items || [];
  const sortedChecklist = [...checklist].sort((a, b) => a.order_index - b.order_index);

  return (
    <div style={{ padding: 32, maxWidth: 680, margin: '0 auto' }}>
      <style>{`
        .editable-field:hover { background: #f3f4f6; border-radius: 4px; }
        .editable-field { transition: background 0.1s; cursor: text; }
      `}</style>

      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div style={{ flex: 1, marginRight: 16 }}>
          {/* Title */}
          {editingField === 'title' ? (
            <input
              autoFocus
              value={editValues.title ?? ''}
              onChange={e => setEditValues(v => ({ ...v, title: e.target.value }))}
              onBlur={() => saveEdit('title')}
              onKeyDown={e => handleKeyDown(e, 'title')}
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: '#111827',
                border: '2px solid #4f46e5',
                borderRadius: 6,
                padding: '4px 8px',
                width: '100%',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          ) : (
            <h2
              className="editable-field"
              onClick={() => startEdit('title')}
              style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#111827', padding: '4px 8px' }}
              title="Click to edit title"
            >
              {task.title}
            </h2>
          )}
        </div>
        <button
          onClick={() => {
            if (confirm(`Delete "${task.title}"?`)) onDeleteTask(task.id);
          }}
          style={{ background: '#fee2e2', border: 'none', color: '#ef4444', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 13, flexShrink: 0 }}
        >
          Delete
        </button>
      </div>

      {/* Done toggle */}
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={task.done}
          onChange={e => onUpdateTask(task.id, { done: e.target.checked })}
          style={{ width: 16, height: 16, cursor: 'pointer' }}
        />
        <span style={{ fontSize: 14, color: '#374151' }}>{task.done ? 'Completed' : 'Mark as done'}</span>
      </label>

      {/* Date */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 4 }}>
          Due Date
        </label>
        {editingField === 'date' ? (
          <input
            type="date"
            autoFocus
            value={editValues.date ?? ''}
            onChange={e => setEditValues(v => ({ ...v, date: e.target.value }))}
            onBlur={() => saveEdit('date')}
            onKeyDown={e => handleKeyDown(e, 'date')}
            style={{ fontSize: 14, border: '2px solid #4f46e5', borderRadius: 6, padding: '4px 8px', outline: 'none', fontFamily: 'inherit' }}
          />
        ) : (
          <span
            className="editable-field"
            onClick={() => startEdit('date')}
            style={{ fontSize: 14, color: task.date ? '#374151' : '#9ca3af', padding: '4px 8px', display: 'inline-block' }}
            title="Click to edit date"
          >
            {task.date || 'No date — click to set'}
          </span>
        )}
      </div>

      {/* Description */}
      <div style={{ marginBottom: 28 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 4 }}>
          Notes
        </label>
        {editingField === 'description' ? (
          <textarea
            autoFocus
            value={editValues.description ?? ''}
            onChange={e => setEditValues(v => ({ ...v, description: e.target.value }))}
            onBlur={() => saveEdit('description')}
            onKeyDown={e => handleKeyDown(e, 'description')}
            rows={4}
            style={{
              fontSize: 14,
              border: '2px solid #4f46e5',
              borderRadius: 6,
              padding: '8px',
              width: '100%',
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />
        ) : (
          <p
            className="editable-field"
            onClick={() => startEdit('description')}
            style={{
              margin: 0,
              fontSize: 14,
              color: task.description ? '#374151' : '#9ca3af',
              padding: '8px',
              minHeight: 60,
              borderRadius: 6,
              border: '1px solid transparent',
              whiteSpace: 'pre-wrap',
            }}
            title="Click to edit notes"
          >
            {task.description || 'Add notes here...'}
          </p>
        )}
      </div>

      {/* Checklist */}
      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
          Checklist {sortedChecklist.length > 0 && `(${sortedChecklist.filter(c => c.done).length}/${sortedChecklist.length})`}
        </label>

        {sortedChecklist.map(item => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <input
              type="checkbox"
              checked={item.done}
              onChange={e => onToggleChecklistItem(task.id, item.id, e.target.checked)}
              style={{ width: 15, height: 15, flexShrink: 0, cursor: 'pointer' }}
            />
            {editingChecklistId === item.id ? (
              <input
                autoFocus
                value={editingChecklistText}
                onChange={e => setEditingChecklistText(e.target.value)}
                onBlur={() => saveEditChecklist(item)}
                onKeyDown={e => {
                  if (e.key === 'Enter') saveEditChecklist(item);
                  if (e.key === 'Escape') setEditingChecklistId(null);
                }}
                style={{ flex: 1, fontSize: 14, border: '2px solid #4f46e5', borderRadius: 4, padding: '2px 6px', outline: 'none', fontFamily: 'inherit' }}
              />
            ) : (
              <span
                onClick={() => startEditChecklist(item)}
                style={{
                  flex: 1,
                  fontSize: 14,
                  color: item.done ? '#9ca3af' : '#374151',
                  textDecoration: item.done ? 'line-through' : 'none',
                  cursor: 'text',
                  padding: '2px 4px',
                  borderRadius: 4,
                }}
                className="editable-field"
              >
                {item.text}
              </span>
            )}
            <button
              onClick={() => onDeleteChecklistItem(task.id, item.id)}
              style={{ background: 'none', border: 'none', color: '#d1d5db', cursor: 'pointer', fontSize: 16, padding: '0 4px', lineHeight: 1 }}
              title="Remove item"
            >
              ×
            </button>
          </div>
        ))}

        {/* New checklist item input */}
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <input
            ref={newItemRef}
            value={newItemText}
            onChange={e => setNewItemText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAddChecklistItem(); }}
            placeholder="Add checklist item..."
            style={{
              flex: 1,
              fontSize: 14,
              border: '1px solid #e5e7eb',
              borderRadius: 6,
              padding: '6px 10px',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
          <button
            onClick={handleAddChecklistItem}
            style={{ background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 13 }}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
