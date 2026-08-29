import type { TaskPriority } from '../../api/tasks.api';

export type TaskField = 'title' | 'priority' | 'assigneeId';

export type EditingTaskField = {
    taskId: string;
    field: TaskField;
    value: string;
} | null;

export type TaskCreateForm = {
    title: string;
    description: string;
    priority: TaskPriority;
    dueDate: string;
    assigneeId: string;
};