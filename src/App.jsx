import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabaseClient';
import Sidebar from './components/Sidebar';
import TaskList from './components/TaskList';
import TaskDetail from './components/TaskDetail';
import NewTaskModal from './components/NewTaskModal';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mobileView, setMobileView] = useState('list');
  const [loading, setLoading] = useState(true);

  // Responsive listener
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Initial load
  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    setLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select('*, checklist_items(*)')
      .order('order_index');
    if (error) {
      console.error('fetchTasks error:', error);
    } else {
      setTasks(data || []);
    }
    setLoading(false);
  }

  async function createTask(title, date, description) {
    const maxOrder = tasks.length > 0 ? Math.max(...tasks.map(t => t.order_index)) + 1 : 0;
    const { data, error } = await supabase
      .from('tasks')
      .insert({ title, date: date || null, description: description || '', order_index: maxOrder })
      .select('*, checklist_items(*)');
    if (error) {
      console.error('createTask error:', error);
      return;
    }
    setTasks(prev => [...prev, data[0]]);
    setSelectedTaskId(data[0].id);
    if (isMobile) setMobileView('detail');
  }

  async function updateTask(id, fields) {
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...fields } : t));
    const { error } = await supabase.from('tasks').update(fields).eq('id', id);
    if (error) {
      console.error('updateTask error:', error);
      fetchTasks(); // revert on error
    }
  }

  async function deleteTask(id) {
    setTasks(prev => prev.filter(t => t.id !== id));
    if (selectedTaskId === id) {
      setSelectedTaskId(null);
      if (isMobile) setMobileView('list');
    }
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) {
      console.error('deleteTask error:', error);
      fetchTasks();
    }
  }

  async function reorderTasks(reorderedArr) {
    setTasks(reorderedArr);
    await Promise.all(
      reorderedArr.map((task, index) =>
        supabase.from('tasks').update({ order_index: index }).eq('id', task.id)
      )
    );
  }

  async function addChecklistItem(taskId, text) {
    const task = tasks.find(t => t.id === taskId);
    const maxOrder = task?.checklist_items?.length ?? 0;
    const { data, error } = await supabase
      .from('checklist_items')
      .insert({ task_id: taskId, text, order_index: maxOrder })
      .select();
    if (error) {
      console.error('addChecklistItem error:', error);
      return;
    }
    setTasks(prev => prev.map(t =>
      t.id === taskId
        ? { ...t, checklist_items: [...(t.checklist_items || []), data[0]] }
        : t
    ));
  }

  async function toggleChecklistItem(taskId, itemId, done) {
    setTasks(prev => prev.map(t =>
      t.id === taskId
        ? { ...t, checklist_items: t.checklist_items.map(c => c.id === itemId ? { ...c, done } : c) }
        : t
    ));
    const { error } = await supabase.from('checklist_items').update({ done }).eq('id', itemId);
    if (error) console.error('toggleChecklistItem error:', error);
  }

  async function deleteChecklistItem(taskId, itemId) {
    setTasks(prev => prev.map(t =>
      t.id === taskId
        ? { ...t, checklist_items: t.checklist_items.filter(c => c.id !== itemId) }
        : t
    ));
    const { error } = await supabase.from('checklist_items').delete().eq('id', itemId);
    if (error) console.error('deleteChecklistItem error:', error);
  }

  async function updateChecklistItem(taskId, itemId, text) {
    setTasks(prev => prev.map(t =>
      t.id === taskId
        ? { ...t, checklist_items: t.checklist_items.map(c => c.id === itemId ? { ...c, text } : c) }
        : t
    ));
    const { error } = await supabase.from('checklist_items').update({ text }).eq('id', itemId);
    if (error) console.error('updateChecklistItem error:', error);
  }

  // Filter tasks for display
  const today = new Date().toISOString().split('T')[0];
  const filteredTasks = tasks.filter(task => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'today') return task.date === today;
    if (activeFilter === 'backlog') return !task.date;
    if (activeFilter === 'upcoming') return task.date && task.date > today;
    return true;
  });

  const selectedTask = tasks.find(t => t.id === selectedTaskId) || null;

  function handleSelectTask(id) {
    setSelectedTaskId(id);
    if (isMobile) setMobileView('detail');
  }

  // ── Layout ──────────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={{ height: '100dvh', fontFamily: 'system-ui, sans-serif', background: '#f5f5f5' }}>
        {mobileView === 'list' && (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '12px 16px', background: '#1a1a2e', color: '#fff', display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={() => setMobileView('sidebar')} style={btnStyle}>☰</button>
              <span style={{ fontWeight: 700, fontSize: 18, flex: 1 }}>TaskFlow</span>
              <button onClick={() => setShowNewTaskModal(true)} style={{ ...btnStyle, background: '#4f46e5', padding: '6px 14px', borderRadius: 6 }}>+ New</button>
            </div>
            <div style={{ flex: 1, overflow: 'auto' }}>
              <TaskList
                tasks={filteredTasks}
                selectedTaskId={selectedTaskId}
                onSelectTask={handleSelectTask}
                onReorderTasks={reorderTasks}
                loading={loading}
              />
            </div>
          </div>
        )}
        {mobileView === 'sidebar' && (
          <div style={{ height: '100%', background: '#1a1a2e' }}>
            <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={() => setMobileView('list')} style={btnStyle}>✕</button>
              <span style={{ fontWeight: 700, fontSize: 18, color: '#fff' }}>Menu</span>
            </div>
            <Sidebar activeFilter={activeFilter} onFilterChange={f => { setActiveFilter(f); setMobileView('list'); }} tasks={tasks} />
          </div>
        )}
        {mobileView === 'detail' && (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '12px 16px', background: '#1a1a2e', color: '#fff', display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={() => setMobileView('list')} style={btnStyle}>← Back</button>
            </div>
            <div style={{ flex: 1, overflow: 'auto', background: '#fff' }}>
              <TaskDetail
                task={selectedTask}
                onUpdateTask={updateTask}
                onDeleteTask={deleteTask}
                onAddChecklistItem={addChecklistItem}
                onToggleChecklistItem={toggleChecklistItem}
                onDeleteChecklistItem={deleteChecklistItem}
                onUpdateChecklistItem={updateChecklistItem}
              />
            </div>
          </div>
        )}
        {showNewTaskModal && (
          <NewTaskModal onClose={() => setShowNewTaskModal(false)} onCreateTask={createTask} />
        )}
      </div>
    );
  }

  // Desktop layout
  return (
    <div style={{ display: 'flex', height: '100dvh', fontFamily: 'system-ui, sans-serif', background: '#f5f5f5' }}>
      <Sidebar activeFilter={activeFilter} onFilterChange={setActiveFilter} tasks={tasks} />
      <div style={{ width: 300, borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', background: '#fff' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, fontSize: 15, color: '#374151' }}>Tasks</span>
          <button
            onClick={() => setShowNewTaskModal(true)}
            style={{ background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 13 }}
          >
            + New
          </button>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          <TaskList
            tasks={filteredTasks}
            selectedTaskId={selectedTaskId}
            onSelectTask={handleSelectTask}
            onReorderTasks={reorderTasks}
            loading={loading}
          />
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'auto', background: '#fafafa' }}>
        <TaskDetail
          task={selectedTask}
          onUpdateTask={updateTask}
          onDeleteTask={deleteTask}
          onAddChecklistItem={addChecklistItem}
          onToggleChecklistItem={toggleChecklistItem}
          onDeleteChecklistItem={deleteChecklistItem}
          onUpdateChecklistItem={updateChecklistItem}
        />
      </div>
      {showNewTaskModal && (
        <NewTaskModal onClose={() => setShowNewTaskModal(false)} onCreateTask={createTask} />
      )}
    </div>
  );
}

const btnStyle = {
  background: 'transparent',
  border: 'none',
  color: '#fff',
  cursor: 'pointer',
  fontSize: 16,
  padding: '4px 8px',
};
