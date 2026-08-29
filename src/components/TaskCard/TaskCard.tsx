import type { DragEvent, KeyboardEvent } from 'react';
import type { Task } from '../../api/tasks.api';
import type { ProjectMember } from '../../api/projects.api';
import type { EditingTaskField, TaskField } from '../../types/task.type';
import { getMemberName } from '../../utils/utils';

type TaskCardProps = {
    task: Task;
    members: ProjectMember[];
    editingTask: EditingTaskField;
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
};

function TaskCard({
    task,
    members,
    editingTask,
    onBeginTaskEdit,
    onTaskEditChange,
    onTaskEditCommit,
    onTaskEditCancel,
    onTaskTitleSubmit,
    onTaskEditKeyDown,
    onDeleteTask,
    onOpenTaskDetails,
    onDragStart,
    onDragEnd,
}: TaskCardProps) {
    const isEditingTitle = editingTask?.taskId === task.id && editingTask.field === 'title';
    const isEditingPriority = editingTask?.taskId === task.id && editingTask.field === 'priority';
    const isEditingAssignee = editingTask?.taskId === task.id && editingTask.field === 'assigneeId';

    return (
        <article className="task-card" draggable onDragStart={(event) => onDragStart(event, task)} onDragEnd={onDragEnd}>
            <div className="task-card-header">
                {isEditingTitle ? (
                    <input
                        className="task-inline-input task-title-input"
                        type="text"
                        value={editingTask.value}
                        onChange={(event) => onTaskEditChange(event.target.value)}
                        onBlur={() => onTaskTitleSubmit(task)}
                        onKeyDown={(event) => onTaskEditKeyDown(event, task)}
                        autoFocus
                        onFocus={(event) => event.currentTarget.select()}
                    />
                ) : (
                    <button type="button" className="task-inline-button task-title-button" onClick={() => onBeginTaskEdit(task, 'title')}>
                        <h3>{task.title}</h3>
                    </button>
                )}

                {isEditingPriority ? (
                    <select
                        className="task-inline-select task-priority-select"
                        value={editingTask.value}
                        onChange={(event) => onTaskEditCommit(task.id, 'priority', event.target.value)}
                        onBlur={onTaskEditCancel}
                        autoFocus
                    >
                        <option value="LOW">LOW</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HIGH">HIGH</option>
                    </select>
                ) : (
                    <button
                        type="button"
                        className={`task-priority task-priority-button ${task.priority.toLowerCase()}`}
                        onClick={() => onBeginTaskEdit(task, 'priority')}
                    >
                        {task.priority}
                    </button>
                )}
            </div>

            {task.description && <p className="task-description">{task.description}</p>}

            <div className="task-card-footer">
                {isEditingAssignee ? (
                    <select
                        className="task-inline-select task-assignee-select"
                        value={editingTask.value}
                        onChange={(event) => onTaskEditCommit(task.id, 'assigneeId', event.target.value)}
                        onBlur={onTaskEditCancel}
                        autoFocus
                    >
                        <option value="">Unassigned</option>
                        {members.map((member) => (
                            <option key={member.user.id} value={member.user.id}>
                                {member.user.nickName}
                            </option>
                        ))}
                    </select>
                ) : (
                    <button type="button" className="task-inline-button task-assignee-button" onClick={() => onBeginTaskEdit(task, 'assigneeId')}>
                        {task.assigneeId ? getMemberName(task.assigneeId, members) : 'Unassigned'}
                    </button>
                )}

                <button type="button" className="task-delete-button" onClick={() => onDeleteTask(task.id)}>
                    Delete
                </button>

                <button type="button" className="task-inline-button task-details-button" onClick={() => onOpenTaskDetails(task)}>
                    Details
                </button>

                {task.dueDate && <span>{new Date(task.dueDate).toLocaleDateString()}</span>}
            </div>
        </article>
    );
}

export default TaskCard;