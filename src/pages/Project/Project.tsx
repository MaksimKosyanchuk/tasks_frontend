import { useEffect, useState, type DragEvent } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';

import {
    getProject,
    updateProjectMember,
    removeProjectMember,
    type Project as ProjectType,
    addProjectMember,
} from '../../api/projects.api';

import {
    createTaskComment,
    createTask,
    deleteTask,
    deleteTaskComment,
    getTaskHistory,
    listTaskComments,
    listTasks,
    type TaskComment,
    type TaskStatusHistoryItem,
    updateTask,
    updateTaskComment,
    type Task,
    type TaskStatus,
} from '../../api/tasks.api';

import { useAuth } from '../../context/useAuth';
import Breadcrumbs from '../../components/BreadCrumbs/BreadCrumbs';

import TaskColumn from '../../components/TaskColumn/TaskColumn';
import ProjectMembers from '../../components/ProjectMembers/ProjectMembers';
import InviteMemberModal from '../../components/InviteMemberModal/InviteMemberModal';
import CreateTaskModal from '../../components/CreateTaskModal/CreateTaskModal';
import TaskDetailsModal from '../../components/TaskDetailsModal/TaskDatailsModal';

import type { EditingTaskField, TaskField, TaskCreateForm } from '../../types/task.type';
import { getUserIdFromToken } from '../../utils/utils';

import './Project.css';

function Project() {
    const { workspaceId, projectId } = useParams();
    const navigate = useNavigate();

    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
    const [memberEmail, setMemberEmail] = useState('');
    const [isInviting, setIsInviting] = useState(false);
    const [memberError, setMemberError] = useState<string | null>(null);

    const { accessToken } = useAuth();
    const currentUserId = getUserIdFromToken(accessToken);

    const [project, setProject] = useState<ProjectType | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [taskCursor, setTaskCursor] = useState<string | null>(null);
    const [hasMoreTasks, setHasMoreTasks] = useState(false);
    const [isLoadingTasks, setIsLoadingTasks] = useState(false);

    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [taskComments, setTaskComments] = useState<TaskComment[]>([]);
    const [taskHistory, setTaskHistory] = useState<TaskStatusHistoryItem[]>([]);
    const [isTaskDetailsLoading, setIsTaskDetailsLoading] = useState(false);
    const [taskDetailsError, setTaskDetailsError] = useState<string | null>(null);
    const [commentDraft, setCommentDraft] = useState('');
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editingCommentContent, setEditingCommentContent] = useState('');

    const [isLoading, setIsLoading] = useState(true);
    const [draggedTask, setDraggedTask] = useState<Task | null>(null);
    const [editingTask, setEditingTask] = useState<EditingTaskField>(null);

    const [taskCreateForm, setTaskCreateForm] = useState<TaskCreateForm>({
        title: '',
        description: '',
        priority: 'MEDIUM',
        dueDate: '',
        assigneeId: '',
    });
    const [isCreatingTask, setIsCreatingTask] = useState(false);

    const [filterStatus, setFilterStatus] = useState<TaskStatus | 'ALL'>('ALL');
    const [filterPriority, setFilterPriority] = useState<Task['priority'] | 'ALL'>('ALL');
    const [filterAssignee, setFilterAssignee] = useState<string | 'ALL'>('ALL');

    useEffect(() => {
        if (!accessToken || !workspaceId || !projectId) return;

        let isActive = true;
        setIsLoading(true);

        getProject(workspaceId, projectId, accessToken)
            .then((projectData) => isActive && setProject(projectData))
            .catch(console.error)
            .finally(() => isActive && setIsLoading(false));

        return () => {
            isActive = false;
        };
    }, [accessToken, workspaceId, projectId]);

    useEffect(() => {
        if (!accessToken || !workspaceId || !projectId) return;

        let isActive = true;
        setIsLoadingTasks(true);

        listTasks(workspaceId, projectId, accessToken, {
            limit: 20,
            status: filterStatus !== 'ALL' ? filterStatus : undefined,
            priority: filterPriority !== 'ALL' ? filterPriority : undefined,
            assigneeId: filterAssignee !== 'ALL' ? filterAssignee : undefined,
        })
            .then((taskPage) => {
                if (!isActive) return;
                setTasks(taskPage.items);
                setTaskCursor(taskPage.nextCursor);
                setHasMoreTasks(taskPage.hasMore);
            })
            .catch(console.error)
            .finally(() => isActive && setIsLoadingTasks(false));

        return () => {
            isActive = false;
        };
    }, [accessToken, workspaceId, projectId, filterStatus, filterPriority, filterAssignee]);

    useEffect(() => {
        if (!accessToken || !projectId) return;

        const socket = io('http://localhost:3001', {
            auth: { token: accessToken },
            withCredentials: true,
        });

        socket.on('connect', () => {
            socket.emit('project:join', { projectId });
        });

        socket.on('project:event', (event: { type: string; projectId: string; taskId?: string; task?: Task }) => {
            if (event.projectId !== projectId) return;

            if (event.type === 'task.deleted' && event.taskId) {
                setTasks((current) => current.filter((task) => task.id !== event.taskId));
                if (selectedTaskId === event.taskId) setSelectedTaskId(null);
                return;
            }

            if (event.task) {
                setTasks((current) => {
                    const existingIndex = current.findIndex((task) => task.id === event.task!.id);
                    if (existingIndex === -1) return [event.task!, ...current];
                    return current.map((task) => (task.id === event.task!.id ? event.task! : task));
                });
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [accessToken, projectId, selectedTaskId]);

    if (isLoading) {
        return <div className="project-loading">Loading project...</div>;
    }

    if (!project) {
        return <Navigate to="/workspaces" replace />;
    }

    const selectedTask = selectedTaskId == null ? null : (tasks.find((task) => task.id === selectedTaskId) ?? null);

    const loadMoreTasks = async () => {
        if (!accessToken || !workspaceId || !projectId || !hasMoreTasks || isLoadingTasks) return;

        setIsLoadingTasks(true);
        try {
            const nextPage = await listTasks(workspaceId, projectId, accessToken, {
                cursor: taskCursor,
                limit: 20,
                status: filterStatus !== 'ALL' ? filterStatus : undefined,
                priority: filterPriority !== 'ALL' ? filterPriority : undefined,
                assigneeId: filterAssignee !== 'ALL' ? filterAssignee : undefined,
            });
            setTasks((current) => [...current, ...nextPage.items]);
            setTaskCursor(nextPage.nextCursor);
            setHasMoreTasks(nextPage.hasMore);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingTasks(false);
        }
    };

    const openTaskDetails = async (task: Task) => {
        if (!accessToken || !workspaceId || !projectId) return;

        setSelectedTaskId(task.id);
        setTaskDetailsError(null);
        setIsTaskDetailsLoading(true);
        setCommentDraft('');
        setEditingCommentId(null);
        setEditingCommentContent('');

        try {
            const [comments, history] = await Promise.all([
                listTaskComments(workspaceId, projectId, task.id, accessToken),
                getTaskHistory(workspaceId, projectId, task.id, accessToken),
            ]);
            setTaskComments(comments);
            setTaskHistory(history);
        } catch (error) {
            console.error(error);
            setTaskDetailsError(error instanceof Error ? error.message : 'Failed to load task details');
        } finally {
            setIsTaskDetailsLoading(false);
        }
    };

    const closeTaskDetails = () => {
        setSelectedTaskId(null);
        setTaskComments([]);
        setTaskHistory([]);
        setTaskDetailsError(null);
        setCommentDraft('');
        setEditingCommentId(null);
        setEditingCommentContent('');
    };

    const handleAddComment = async () => {
        if (!selectedTask || !accessToken || !workspaceId || !projectId || !commentDraft.trim()) return;

        try {
            const comment = await createTaskComment(workspaceId, projectId, selectedTask.id, commentDraft.trim(), accessToken);
            setTaskComments((current) => [comment, ...current]);
            setCommentDraft('');
        } catch (error) {
            console.error(error);
        }
    };

    const beginCommentEdit = (comment: TaskComment) => {
        setEditingCommentId(comment.id);
        setEditingCommentContent(comment.content);
    };

    const handleUpdateComment = async (commentId: string) => {
        if (!selectedTask || !accessToken || !workspaceId || !projectId || !editingCommentContent.trim()) return;

        try {
            const updatedComment = await updateTaskComment(workspaceId, projectId, selectedTask.id, commentId, editingCommentContent.trim(), accessToken);
            setTaskComments((current) => current.map((comment) => (comment.id === commentId ? updatedComment : comment)));
            setEditingCommentId(null);
            setEditingCommentContent('');
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!selectedTask || !accessToken || !workspaceId || !projectId) return;

        try {
            await deleteTaskComment(workspaceId, projectId, selectedTask.id, commentId, accessToken);
            setTaskComments((current) => current.filter((comment) => comment.id !== commentId));
        } catch (error) {
            console.error(error);
        }
    };

    const resolvePreferredAssignee = () => {
        if (currentUserId && project.members.some((member) => member.user.id === currentUserId)) {
            return currentUserId;
        }
        return project.members[0]?.user.id || '';
    };

    const openCreateTaskModal = () => {
        setTaskCreateForm({
            title: '',
            description: '',
            priority: 'MEDIUM',
            dueDate: '',
            assigneeId: resolvePreferredAssignee(),
        });
        setIsCreateTaskOpen(true);
    };

    const beginTaskEdit = (task: Task, field: TaskField) => {
        setEditingTask({
            taskId: task.id,
            field,
            value: field === 'title' ? task.title : field === 'priority' ? task.priority : (task.assigneeId ?? ''),
        });
    };

    const cancelTaskEdit = () => setEditingTask(null);

    const applyTaskFieldChange = async (taskId: string, field: TaskField, value: string) => {
        const normalizedValue = field === 'assigneeId' && value === '' ? null : value;
        const previousTasks = tasks;

        setTasks((current) =>
            current.map((task) => {
                if (task.id !== taskId) return task;
                if (field === 'title') return { ...task, title: value };
                if (field === 'priority') return { ...task, priority: value as Task['priority'] };
                return { ...task, assigneeId: normalizedValue };
            }),
        );

        try {
            await updateTask(
                workspaceId!,
                projectId!,
                taskId,
                { [field]: normalizedValue } as { title?: string; priority?: Task['priority']; assigneeId?: string | null },
                accessToken!,
            );
        } catch (error) {
            console.error(error);
            setTasks(previousTasks);
        }

        setEditingTask(null);
    };

    const handleTaskTitleSubmit = (task: Task) => {
        if (!editingTask || editingTask.taskId !== task.id || editingTask.field !== 'title') return;

        const nextTitle = editingTask.value.trim();
        if (!nextTitle) {
            setEditingTask(null);
            return;
        }

        applyTaskFieldChange(task.id, 'title', nextTitle);
    };

    const handleTaskEditKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, task: Task) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleTaskTitleSubmit(task);
        }
        if (event.key === 'Escape') {
            event.preventDefault();
            cancelTaskEdit();
        }
    };

    const handleCreateTask = async () => {
        if (!taskCreateForm.title.trim() || !taskCreateForm.dueDate || !taskCreateForm.assigneeId) return;

        setIsCreatingTask(true);
        try {
            await createTask(
                workspaceId!,
                projectId!,
                {
                    title: taskCreateForm.title.trim(),
                    description: taskCreateForm.description.trim() || undefined,
                    priority: taskCreateForm.priority,
                    dueDate: taskCreateForm.dueDate,
                    assigneeId: taskCreateForm.assigneeId,
                },
                accessToken!,
            );
            setIsCreateTaskOpen(false);
            setTaskCreateForm({
                title: '',
                description: '',
                priority: 'MEDIUM',
                dueDate: '',
                assigneeId: resolvePreferredAssignee(),
            });
        } catch (error) {
            console.error(error);
        } finally {
            setIsCreatingTask(false);
        }
    };

    const handleAddMember = async () => {
        if (!accessToken || !workspaceId || !projectId || !memberEmail.trim()) return;

        setIsInviting(true);
        setMemberError(null);

        try {
            await addProjectMember(workspaceId, projectId, memberEmail, accessToken);
            setMemberEmail('');
            setIsInviteModalOpen(false);

            const updatedProject = await getProject(workspaceId, projectId, accessToken);
            setProject(updatedProject);
            setTasks(updatedProject.tasks);
        } catch (error) {
            setMemberError(error instanceof Error ? error.message : 'Failed to add member');
        } finally {
            setIsInviting(false);
        }
    };

    const handleChangeRole = async (userId: string, role: 'OWNER' | 'MEMBER') => {
        await updateProjectMember(workspaceId!, projectId!, userId, role, accessToken!);

        setProject((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                members: prev.members.map((member) => (member.userId === userId ? { ...member, role } : member)),
            };
        });
    };

    const handleRemoveMember = async (userId: string) => {
        await removeProjectMember(workspaceId!, projectId!, userId, accessToken!);

        if (currentUserId && userId === currentUserId) {
            navigate('/workspaces', { replace: true });
            return;
        }

        setProject((prev) => {
            if (!prev) return prev;
            return { ...prev, members: prev.members.filter((member) => member.user.id !== userId) };
        });
    };

    const handleDragStart = (event: DragEvent<HTMLElement>, task: Task) => {
        setDraggedTask(task);
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', task.id);
    };

    const handleDragEnd = () => setDraggedTask(null);

    const handleDrop = async (event: DragEvent<HTMLElement>, status: TaskStatus) => {
        event.preventDefault();
        if (!draggedTask || !accessToken) return;

        const previousStatus = draggedTask.status;
        if (previousStatus === status) {
            setDraggedTask(null);
            return;
        }

        setTasks((current) => current.map((task) => (task.id === draggedTask.id ? { ...task, status } : task)));

        try {
            await updateTask(workspaceId!, projectId!, draggedTask.id, { status }, accessToken);
        } catch (error) {
            console.error(error);
            setTasks((current) => current.map((task) => (task.id === draggedTask.id ? { ...task, status: previousStatus } : task)));
        } finally {
            setDraggedTask(null);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        const previousTasks = tasks;
        setTasks((current) => current.filter((task) => task.id !== taskId));
        if (selectedTaskId === taskId) closeTaskDetails();

        try {
            await deleteTask(workspaceId!, projectId!, taskId, accessToken!);
        } catch (error) {
            console.error(error);
            setTasks(previousTasks);
        }
    };

    const columnHandlers = {
        tasks,
        members: project.members,
        editingTask,
        onBeginTaskEdit: beginTaskEdit,
        onTaskEditChange: (value: string) => setEditingTask((current) => (current ? { ...current, value } : current)),
        onTaskEditCommit: applyTaskFieldChange,
        onTaskEditCancel: cancelTaskEdit,
        onTaskTitleSubmit: handleTaskTitleSubmit,
        onTaskEditKeyDown: handleTaskEditKeyDown,
        onDeleteTask: handleDeleteTask,
        onOpenTaskDetails: openTaskDetails,
        onDragStart: handleDragStart,
        onDragEnd: handleDragEnd,
        onDrop: handleDrop,
    };

    return (
        <>
            <Breadcrumbs currentWorkspace={project.workspace} project={{ id: project.id, name: project.name }} />

            <section className="project-page">
                <main className="project-content">
                    <header className="project-header">
                        <div className="project-header-copy">
                            <h1>{project.name}</h1>
                            {project.description && <p>{project.description}</p>}
                        </div>
                        <button type="button" className="create-task-button" onClick={openCreateTaskModal}>
                            + Task
                        </button>
                    </header>

                    <div className="task-filters">
                        <select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value as TaskStatus | 'ALL')}>
                            <option value="ALL">All statuses</option>
                            <option value="TODO">To Do</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="DONE">Done</option>
                        </select>

                        <select value={filterPriority} onChange={(event) => setFilterPriority(event.target.value as Task['priority'] | 'ALL')}>
                            <option value="ALL">All priorities</option>
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                        </select>

                        <select value={filterAssignee} onChange={(event) => setFilterAssignee(event.target.value)}>
                            <option value="ALL">All assignees</option>
                            {project.members.map((member) => (
                                <option key={member.user.id} value={member.user.id}>
                                    {member.user.nickName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="task-board">
                        <TaskColumn title="To Do" status="TODO" {...columnHandlers} />
                        <TaskColumn title="In Progress" status="IN_PROGRESS" {...columnHandlers} />
                        <TaskColumn title="Done" status="DONE" {...columnHandlers} />
                    </div>

                    {hasMoreTasks && (
                        <div className="task-pagination">
                            <button type="button" className="task-pagination-button" onClick={loadMoreTasks} disabled={isLoadingTasks}>
                                {isLoadingTasks ? 'Loading...' : 'Load more tasks'}
                            </button>
                        </div>
                    )}
                </main>

                <ProjectMembers
                    members={project.members}
                    onAddMember={() => setIsInviteModalOpen(true)}
                    onRoleChange={handleChangeRole}
                    onRemoveMember={handleRemoveMember}
                />
            </section>

            <InviteMemberModal
                isOpen={isInviteModalOpen}
                email={memberEmail}
                isInviting={isInviting}
                error={memberError}
                onEmailChange={setMemberEmail}
                onSubmit={handleAddMember}
                onClose={() => {
                    setIsInviteModalOpen(false);
                    setMemberEmail('');
                    setMemberError(null);
                }}
            />

            <CreateTaskModal
                isOpen={isCreateTaskOpen}
                form={taskCreateForm}
                isCreating={isCreatingTask}
                members={project.members}
                onChange={setTaskCreateForm}
                onSubmit={handleCreateTask}
                onClose={() => setIsCreateTaskOpen(false)}
            />

            <TaskDetailsModal
                task={selectedTask}
                members={project.members}
                currentUserId={currentUserId}
                comments={taskComments}
                history={taskHistory}
                isLoading={isTaskDetailsLoading}
                error={taskDetailsError}
                commentDraft={commentDraft}
                editingCommentId={editingCommentId}
                editingCommentContent={editingCommentContent}
                onCommentDraftChange={setCommentDraft}
                onAddComment={handleAddComment}
                onBeginCommentEdit={beginCommentEdit}
                onEditingCommentContentChange={setEditingCommentContent}
                onUpdateComment={handleUpdateComment}
                onCancelCommentEdit={() => {
                    setEditingCommentId(null);
                    setEditingCommentContent('');
                }}
                onDeleteComment={handleDeleteComment}
                onClose={closeTaskDetails}
            />
        </>
    );
}

export default Project;