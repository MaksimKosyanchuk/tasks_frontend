import Modal from '../../components/Modal/Modal';
import type { ProjectMember } from '../../api/projects.api';
import type { TaskPriority } from '../../api/tasks.api';
import type { TaskCreateForm } from '../../types/task.type';

import "./CreateTaskModal.css";

type CreateTaskModalProps = {
    isOpen: boolean;
    form: TaskCreateForm;
    isCreating: boolean;
    members: ProjectMember[];
    onChange: (form: TaskCreateForm) => void;
    onSubmit: () => void;
    onClose: () => void;
};

function CreateTaskModal({ isOpen, form, isCreating, members, onChange, onSubmit, onClose }: CreateTaskModalProps) {
    return (
        <Modal isOpen={isOpen} title="Create task" onClose={onClose}>
            <div className="create-task-form">
                <div className="form-field">
                    <label htmlFor="task-title">Title</label>
                    <input
                        id="task-title"
                        type="text"
                        placeholder="Task title"
                        value={form.title}
                        onChange={(event) => onChange({ ...form, title: event.target.value })}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') onSubmit();
                        }}
                        autoFocus
                    />
                </div>

                <div className="form-field">
                    <label htmlFor="task-description">Description</label>
                    <textarea
                        id="task-description"
                        placeholder="Optional description"
                        value={form.description}
                        onChange={(event) => onChange({ ...form, description: event.target.value })}
                        rows={3}
                    />
                </div>

                <div className="task-form-grid">
                    <div className="form-field">
                        <label htmlFor="task-priority">Priority</label>
                        <select id="task-priority" value={form.priority} onChange={(event) => onChange({ ...form, priority: event.target.value as TaskPriority })}>
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                        </select>
                    </div>

                    <div className="form-field">
                        <label htmlFor="task-due-date">Due date</label>
                        <input id="task-due-date" type="date" value={form.dueDate} onChange={(event) => onChange({ ...form, dueDate: event.target.value })} />
                    </div>
                </div>

                <div className="form-field">
                    <label htmlFor="task-assignee">Assignee</label>
                    <select id="task-assignee" value={form.assigneeId} onChange={(event) => onChange({ ...form, assigneeId: event.target.value })}>
                        <option value="">Select member</option>
                        {members.map((member) => (
                            <option key={member.user.id} value={member.user.id}>
                                {member.user.nickName}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="modal-actions">
                    <button type="button" className="modal-button secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="modal-button primary"
                        onClick={onSubmit}
                        disabled={isCreating || !form.title.trim() || !form.dueDate || !form.assigneeId}
                    >
                        {isCreating ? 'Creating...' : 'Create'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

export default CreateTaskModal;