import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import TaskCard from './TaskCard';
import type { Task } from '../../api/tasks.api';
import type { ProjectMember } from '../../api/projects.api';

const mockTask: Task = {
    id: 'task-1',
    title: 'Написати тести',
    description: 'Покрити TaskCard базовими тестами',
    status: 'TODO',
    priority: 'HIGH',
    dueDate: '2026-09-01',
    assigneeId: 'user-1',
} as Task;

const mockMembers: ProjectMember[] = [
    {
        id: 'member-1',
        userId: 'user-1',
        role: 'MEMBER',
        user: { id: 'user-1', nickName: 'Олена', email: 'olena@example.com' },
    } as ProjectMember,
];

const noop = () => {};

function renderTaskCard(overrides: Partial<React.ComponentProps<typeof TaskCard>> = {}) {
    return render(
        <TaskCard
            task={mockTask}
            members={mockMembers}
            editingTask={null}
            isDragging={false}
            onBeginTaskEdit={noop}
            onTaskEditChange={noop}
            onTaskEditCommit={noop}
            onTaskEditCancel={noop}
            onTaskTitleSubmit={noop}
            onTaskEditKeyDown={noop}
            onDeleteTask={noop}
            onOpenTaskDetails={noop}
            onDragStart={noop}
            onDragEnd={noop}
            {...overrides}
        />,
    );
}

describe('TaskCard', () => {
    it('відображає назву, пріоритет, опис та ім\'я виконавця', () => {
        renderTaskCard();

        expect(screen.getByText('Написати тести')).toBeInTheDocument();
        expect(screen.getByText('HIGH')).toBeInTheDocument();
        expect(screen.getByText('Покрити TaskCard базовими тестами')).toBeInTheDocument();
        expect(screen.getByText('Олена')).toBeInTheDocument();
    });

    it('викликає onDeleteTask з id задачі при кліку на "Delete"', async () => {
        const onDeleteTask = vi.fn();
        const user = userEvent.setup();

        renderTaskCard({ onDeleteTask });

        await user.click(screen.getByRole('button', { name: 'Delete' }));

        expect(onDeleteTask).toHaveBeenCalledTimes(1);
        expect(onDeleteTask).toHaveBeenCalledWith('task-1');
    });
});