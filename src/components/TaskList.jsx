import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import TaskCard from './TaskCard';

export default function TaskList({ tasks, selectedTaskId, onSelectTask, onReorderTasks, loading }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  function handleDragEnd({ active, over }) {
    if (!over || active.id === over.id) return;
    const oldIndex = tasks.findIndex(t => t.id === active.id);
    const newIndex = tasks.findIndex(t => t.id === over.id);
    onReorderTasks(arrayMove(tasks, oldIndex, newIndex));
  }

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
        Loading...
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
        No tasks here.<br />
        <span style={{ fontSize: 12 }}>Create one with + New</span>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div style={{ padding: '8px 0' }}>
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              selected={task.id === selectedTaskId}
              onClick={() => onSelectTask(task.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
