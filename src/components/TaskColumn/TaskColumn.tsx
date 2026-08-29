import { useState, type DragEvent, type KeyboardEvent } from 'react';
import type { Task, TaskStatus } from '../../api/tasks.api';
import type { ProjectMember } from '../../api/projects.api';
import type { EditingTaskField, TaskField } from '../../types/task.type';
import TaskCard from '../TaskCard/TaskCard';

import "./TaskColumn.css";

type TaskColumnProps = {
    title: string;
    status: TaskStatus;
    tasks: Task[];
    members: ProjectMember[];
    editingTask: EditingTaskField;
    draggedTaskId: string | null;
    onBeginTaskEdit: (task: Task, field: TaskField) => void;
    onTaskEditChange: (value: string) => void;
    onTaskEditCommit: (taskId: string, field: TaskField, value: string) => void;
    onTaskEditCancel: () => void;
    onTaskTitleSubmit: (task: Task) => void;
    onTaskEditKeyDown: (event: KeyboardEvent<HTMLInputElement>, task: Task) => void;
    onDeleteTask: (taskId: string) => void;
    onOpenTaskDetails: (task: Task) => void;
    onDragStart: (event: DragEvent<HTMLElement>, task: Task) => void;
    onDragEnd: () => void;
    onDrop: (event: DragEvent<HTMLElement>, status: TaskStatus) => void;
};

function TaskColumn({ title, status, tasks, members, draggedTaskId, onDrop, ...cardHandlers }: TaskColumnProps) {
    const [isDragOver, setIsDragOver] = useState(false);

    const columnTasks = tasks.filter((task) => task.status === status);

    return (
        <section
            className={`task-column ${isDragOver ? 'drag-over' : ''}`}
            onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
                if (!isDragOver) setIsDragOver(true);
            }}
            onDragLeave={(event) => {
                // игнорируем dragleave, если курсор просто перешёл на дочерний элемент внутри колонки
                if (event.currentTarget.contains(event.relatedTarget as Node)) return;
                setIsDragOver(false);
            }}
            onDrop={(event) => {
                setIsDragOver(false);
                onDrop(event, status);
            }}
        >
            <div className="task-column-header">
                <h2>{title}</h2>
                <span>{columnTasks.length}</span>
            </div>

            <div className="task-list">
                {columnTasks.map((task) => (
                    <TaskCard key={task.id} task={task} isDragging={draggedTaskId === task.id} members={members} {...cardHandlers} />
                ))}
            </div>
        </section>
    );
}

export default TaskColumn;