import Modal from '../Modal/Modal';
import type { ProjectMember } from '../../api/projects.api';
import type { Task, TaskComment, TaskStatusHistoryItem } from '../../api/tasks.api';
import { getMemberName } from '../../utils/utils';

import "./TaskDetailsModal.css";

type TaskDetailsModalProps = {
    task: Task | null;
    members: ProjectMember[];
    currentUserId: string | null;
    comments: TaskComment[];
    history: TaskStatusHistoryItem[];
    isLoading: boolean;
    error: string | null;
    commentDraft: string;
    editingCommentId: string | null;
    editingCommentContent: string;
    onCommentDraftChange: (value: string) => void;
    onAddComment: () => void;
    onBeginCommentEdit: (comment: TaskComment) => void;
    onEditingCommentContentChange: (value: string) => void;
    onUpdateComment: (commentId: string) => void;
    onCancelCommentEdit: () => void;
    onDeleteComment: (commentId: string) => void;
    onClose: () => void;
};

function TaskDetailsModal({
    task,
    members,
    currentUserId,
    comments,
    history,
    isLoading,
    error,
    commentDraft,
    editingCommentId,
    editingCommentContent,
    onCommentDraftChange,
    onAddComment,
    onBeginCommentEdit,
    onEditingCommentContentChange,
    onUpdateComment,
    onCancelCommentEdit,
    onDeleteComment,
    onClose,
}: TaskDetailsModalProps) {
    return (
        <Modal isOpen={!!task} title={task?.title ?? 'Task details'} onClose={onClose}>
            {task && (
                <div className="task-details">
                    <div className="task-details-meta">
                        <div>
                            <strong>Priority:</strong> {task.priority}
                        </div>
                        <div>
                            <strong>Status:</strong> {task.status}
                        </div>
                        <div>
                            <strong>Assignee:</strong> {task.assigneeId ? getMemberName(task.assigneeId, members) : 'Unassigned'}
                        </div>
                    </div>

                    {error && <p className="task-details-error">{error}</p>}

                    <section className="task-details-section">
                        <h3>Comments</h3>

                        {isLoading ? (
                            <p>Loading...</p>
                        ) : (
                            <>
                                <div className="task-comment-form">
                                    <textarea placeholder="Write a comment..." value={commentDraft} onChange={(event) => onCommentDraftChange(event.target.value)} rows={3} />
                                    <button type="button" className="task-pagination-button" onClick={onAddComment} disabled={!commentDraft.trim()}>
                                        Add comment
                                    </button>
                                </div>

                                <div className="task-comment-list">
                                    {comments.length === 0 ? (
                                        <p className="task-details-empty">No comments yet</p>
                                    ) : (
                                        comments.map((comment) => (
                                            <article key={comment.id} className="task-comment">
                                                <div className="task-comment-header">
                                                    <strong>{comment.user.nickName}</strong>
                                                    <span>{new Date(comment.createdAt).toLocaleString()}</span>
                                                </div>

                                                {editingCommentId === comment.id ? (
                                                    <textarea value={editingCommentContent} onChange={(event) => onEditingCommentContentChange(event.target.value)} rows={3} />
                                                ) : (
                                                    <p>{comment.content}</p>
                                                )}

                                                {comment.userId === currentUserId && (
                                                    <div className="task-comment-actions">
                                                        {editingCommentId === comment.id ? (
                                                            <>
                                                                <button type="button" onClick={() => onUpdateComment(comment.id)}>
                                                                    Save
                                                                </button>
                                                                <button type="button" onClick={onCancelCommentEdit}>
                                                                    Cancel
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button type="button" onClick={() => onBeginCommentEdit(comment)}>
                                                                    Edit
                                                                </button>
                                                                <button type="button" onClick={() => onDeleteComment(comment.id)}>
                                                                    Delete
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </article>
                                        ))
                                    )}
                                </div>
                            </>
                        )}
                    </section>

                    <section className="task-details-section">
                        <h3>Status history</h3>

                        {history.length === 0 ? (
                            <p className="task-details-empty">No status changes yet</p>
                        ) : (
                            <div className="task-history-list">
                                {history.map((entry) => (
                                    <article key={entry.id} className="task-history-item">
                                        <strong>{entry.changedBy.nickName}</strong>
                                        <span>
                                            {entry.oldStatus} -&gt; {entry.newStatus}
                                        </span>
                                        <small>{new Date(entry.createdAt).toLocaleString()}</small>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            )}
        </Modal>
    );
}

export default TaskDetailsModal;