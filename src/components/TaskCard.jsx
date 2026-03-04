import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function TaskCard({ task, selected, onClick }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const checklistTotal = task.checklist_items?.length ?? 0;
  const checklistDone = task.checklist_items?.filter(c => c.done).length ?? 0;

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 12px',
        margin: '2px 8px',
        borderRadius: 8,
        background: selected ? '#ede9fe' : '#fff',
        border: selected ? '1px solid #c4b5fd' : '1px solid #e5e7eb',
        cursor: 'pointer',
        boxShadow: isDragging ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
      }}
    >
      {/* Drag handle — listeners only here */}
      <span
        {...attributes}
        {...listeners}
        onClick={e => e.stopPropagation()}
        style={{
          cursor: 'grab',
          color: '#d1d5db',
          fontSize: 16,
          lineHeight: 1,
          padding: '2px 4px',
          userSelect: 'none',
          flexShrink: 0,
        }}
        title="Drag to reorder"
      >
        ⠿
      </span>

      {/* Done checkbox */}
      <input
        type="checkbox"
        checked={task.done}
        onChange={e => { e.stopPropagation(); }}
        onClick={e => e.stopPropagation()}
        style={{ flexShrink: 0, cursor: 'pointer', width: 15, height: 15 }}
        readOnly
      />

      {/* Content */}
      <div onClick={onClick} style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14,
          fontWeight: 500,
          color: task.done ? '#9ca3af' : '#1f2937',
          textDecoration: task.done ? 'line-through' : 'none',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {task.title}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 3, alignItems: 'center' }}>
          {task.date && (
            <span style={{ fontSize: 11, color: '#6b7280' }}>{task.date}</span>
          )}
          {checklistTotal > 0 && (
            <span style={{ fontSize: 11, color: '#6b7280' }}>
              ✓ {checklistDone}/{checklistTotal}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
