const today = new Date().toISOString().split('T')[0];

const filters = [
  { id: 'all', label: '📋 All Tasks' },
  { id: 'today', label: '📅 Today' },
  { id: 'upcoming', label: '🗓️ Upcoming' },
  { id: 'backlog', label: '📦 Backlog' },
];

export default function Sidebar({ activeFilter, onFilterChange, tasks }) {
  const counts = {
    all: tasks.length,
    today: tasks.filter(t => t.date === today).length,
    upcoming: tasks.filter(t => t.date && t.date > today).length,
    backlog: tasks.filter(t => !t.date).length,
  };

  return (
    <div style={{ width: 220, background: '#1a1a2e', color: '#e2e8f0', display: 'flex', flexDirection: 'column', padding: '24px 0' }}>
      <div style={{ padding: '0 20px 24px', borderBottom: '1px solid #2d2d4e' }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>
          TaskFlow
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Your task manager</p>
      </div>
      <nav style={{ padding: '16px 0' }}>
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => onFilterChange(f.id)}
            style={{
              width: '100%',
              textAlign: 'left',
              background: activeFilter === f.id ? '#2d2d5e' : 'transparent',
              border: 'none',
              borderLeft: activeFilter === f.id ? '3px solid #4f46e5' : '3px solid transparent',
              color: activeFilter === f.id ? '#a5b4fc' : '#9ca3af',
              padding: '10px 20px',
              cursor: 'pointer',
              fontSize: 14,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transition: 'all 0.15s',
            }}
          >
            <span>{f.label}</span>
            <span style={{
              background: activeFilter === f.id ? '#4f46e5' : '#2d2d4e',
              color: activeFilter === f.id ? '#fff' : '#6b7280',
              borderRadius: 10,
              padding: '1px 7px',
              fontSize: 11,
              fontWeight: 600,
            }}>
              {counts[f.id]}
            </span>
          </button>
        ))}
      </nav>
      <div style={{ flex: 1 }} />
      <div style={{ padding: '16px 20px', fontSize: 11, color: '#4b5563', borderTop: '1px solid #2d2d4e' }}>
        {tasks.filter(t => t.done).length} of {tasks.length} done
      </div>
    </div>
  );
}
