
import {
    useEffect,
    useState,
} from 'react';

import {
    Navigate,
    useParams,
} from 'react-router-dom';

import {
    getProject,
    type Project as ProjectType,
    type ProjectMember,
} from '../../api/projects.api';

import {
    updateTask,
    type Task,
    type TaskStatus,
    type TaskPriority,
} from '../../api/tasks.api';

import {
    useAuth,
} from '../../context/useAuth';

import Breadcrumbs from '../../components/BreadCrumbs/BreadCrumbs';

import './Project.css';

function Project() {
    const {
        workspaceId,
        projectId,
    } = useParams();

    const {
        accessToken,
    } = useAuth();

    const [
        project,
        setProject,
    ] = useState<ProjectType | null>(null);

    const [
        tasks,
        setTasks,
    ] = useState<Task[]>([]);

    const [
        isLoading,
        setIsLoading,
    ] = useState(true);

    const [
        draggedTask,
        setDraggedTask,
    ] = useState<Task | null>(null);

    const [
        filterStatus,
        setFilterStatus,
    ] = useState<TaskStatus | 'ALL'>(
        'ALL',
    );

    const [
        filterPriority,
        setFilterPriority,
    ] = useState<TaskPriority | 'ALL'>(
        'ALL',
    );

    const [
        filterAssignee,
        setFilterAssignee,
    ] = useState<string | 'ALL'>(
        'ALL',
    );

    useEffect(() => {
        if (
            !accessToken ||
            !workspaceId ||
            !projectId
        ) {
            return;
        }

        setIsLoading(true);

        getProject(
            workspaceId,
            projectId,
            accessToken,
        )
            .then((project) => {
                setProject(project);
                setTasks(project.tasks);
            })
            .catch(console.error)
            .finally(() => {
                setIsLoading(false);
            });
    }, [
        accessToken,
        workspaceId,
        projectId,
    ]);

    if (isLoading) {
        return (
            <div className="project-loading">
                Loading project...
            </div>
        );
    }

    if (!project) {
        return (
            <Navigate
                to="/workspaces"
                replace
            />
        );
    }

    const filteredTasks = tasks.filter(
        (task) => {
            if (
                filterStatus !== 'ALL' &&
                task.status !== filterStatus
            ) {
                return false;
            }

            if (
                filterPriority !== 'ALL' &&
                task.priority !== filterPriority
            ) {
                return false;
            }

            if (
                filterAssignee !== 'ALL' &&
                task.assigneeId !== filterAssignee
            ) {
                return false;
            }

            return true;
        },
    );

    const handleDragStart = (
        event: React.DragEvent<HTMLElement>,
        task: Task,
    ) => {
        setDraggedTask(task);

        event.dataTransfer.effectAllowed =
            'move';

        event.dataTransfer.setData(
            'text/plain',
            task.id,
        );
    };

    const handleDragEnd = () => {
        setDraggedTask(null);
    };

    const handleDrop = async (
        event: React.DragEvent<HTMLElement>,
        status: TaskStatus,
    ) => {
        event.preventDefault();

        if (
            !draggedTask ||
            !accessToken
        ) {
            return;
        }

        const previousStatus =
            draggedTask.status;

        if (
            previousStatus === status
        ) {
            setDraggedTask(null);
            return;
        }

        // Сразу меняем колонку на UI
        setTasks((currentTasks) =>
            currentTasks.map(
                (task) =>
                    task.id === draggedTask.id
                        ? {
                            ...task,
                            status,
                        }
                        : task,
            ),
        );

        setDraggedTask(null);

        try {
            await updateTask(
                workspaceId!,
                projectId!,
                draggedTask.id,
                {
                    status,
                },
                accessToken,
            );
        } catch (error) {
            console.error(error);

            // Если PATCH не прошёл,
            // возвращаем старый статус
            setTasks((currentTasks) =>
                currentTasks.map(
                    (task) =>
                        task.id ===
                        draggedTask.id
                            ? {
                                ...task,
                                status:
                                    previousStatus,
                            }
                            : task,
                ),
            );
        }
    };

    return (
        <>
            <Breadcrumbs
                currentWorkspace={
                    project.workspace
                }
                project={{
                    id: project.id,
                    name: project.name,
                }}
            />

            <section className="project-page">
                <main className="project-content">
                    <header className="project-header">
                        <div>
                            <h1>
                                {project.name}
                            </h1>

                            {project.description && (
                                <p>
                                    {
                                        project.description
                                    }
                                </p>
                            )}
                        </div>
                    </header>

                    <div className="task-filters">
                        <select
                            value={
                                filterStatus
                            }
                            onChange={(event) =>
                                setFilterStatus(
                                    event.target
                                        .value as
                                        | TaskStatus
                                        | 'ALL',
                                )
                            }
                        >
                            <option value="ALL">
                                All statuses
                            </option>

                            <option value="TODO">
                                To Do
                            </option>

                            <option value="IN_PROGRESS">
                                In Progress
                            </option>

                            <option value="DONE">
                                Done
                            </option>
                        </select>

                        <select
                            value={
                                filterPriority
                            }
                            onChange={(event) =>
                                setFilterPriority(
                                    event.target
                                        .value as
                                        | TaskPriority
                                        | 'ALL',
                                )
                            }
                        >
                            <option value="ALL">
                                All priorities
                            </option>

                            <option value="LOW">
                                Low
                            </option>

                            <option value="MEDIUM">
                                Medium
                            </option>

                            <option value="HIGH">
                                High
                            </option>
                        </select>

                        <select
                            value={
                                filterAssignee
                            }
                            onChange={(event) =>
                                setFilterAssignee(
                                    event.target.value,
                                )
                            }
                        >
                            <option value="ALL">
                                All assignees
                            </option>

                            {project.members.map(
                                (member) => (
                                    <option
                                        key={
                                            member.user.id
                                        }
                                        value={
                                            member.user.id
                                        }
                                    >
                                        {
                                            member.user
                                                .nickName
                                        }
                                    </option>
                                ),
                            )}
                        </select>
                    </div>

                    <div className="task-board">
                        <TaskColumn
                            title="To Do"
                            status="TODO"
                            tasks={filteredTasks}
                            members={
                                project.members
                            }
                            onDragStart={
                                handleDragStart
                            }
                            onDragEnd={
                                handleDragEnd
                            }
                            onDrop={handleDrop}
                        />

                        <TaskColumn
                            title="In Progress"
                            status="IN_PROGRESS"
                            tasks={filteredTasks}
                            members={
                                project.members
                            }
                            onDragStart={
                                handleDragStart
                            }
                            onDragEnd={
                                handleDragEnd
                            }
                            onDrop={handleDrop}
                        />

                        <TaskColumn
                            title="Done"
                            status="DONE"
                            tasks={filteredTasks}
                            members={
                                project.members
                            }
                            onDragStart={
                                handleDragStart
                            }
                            onDragEnd={
                                handleDragEnd
                            }
                            onDrop={handleDrop}
                        />
                    </div>
                </main>

                <ProjectMembers
                    members={project.members}
                />
            </section>
        </>
    );
}

type TaskColumnProps = {
    title: string;
    status: TaskStatus;
    tasks: Task[];
    members: ProjectMember[];

    onDragStart: (
        event: React.DragEvent<HTMLElement>,
        task: Task,
    ) => void;

    onDragEnd: () => void;

    onDrop: (
        event: React.DragEvent<HTMLElement>,
        status: TaskStatus,
    ) => void;
};

function TaskColumn({
    title,
    status,
    tasks,
    members,
    onDragStart,
    onDragEnd,
    onDrop,
}: TaskColumnProps) {
    const columnTasks =
        tasks.filter(
            (task) =>
                task.status === status,
        );

    return (
        <section
            className="task-column"
            onDragOver={(event) => {
                event.preventDefault();

                event.dataTransfer.dropEffect =
                    'move';
            }}
            onDrop={(event) =>
                onDrop(event, status)
            }
        >
            <div className="task-column-header">
                <h2>{title}</h2>

                <span>
                    {columnTasks.length}
                </span>
            </div>

            <div className="task-list">
                {columnTasks.map(
                    (task) => (
                        <article
                            key={task.id}
                            className={`task-card`}
                            draggable
                            onDragStart={(event) =>
                                onDragStart(
                                    event,
                                    task,
                                )
                            }
                            onDragEnd={
                                onDragEnd
                            }
                        >
                            <div className="task-card-header">
                                <h3>
                                    {task.title}
                                </h3>

                                <span
                                    className={`task-priority ${task.priority.toLowerCase()}`}
                                >
                                    {
                                        task.priority
                                    }
                                </span>
                            </div>

                            {task.description && (
                                <p className="task-description">
                                    {
                                        task.description
                                    }
                                </p>
                            )}

                            <div className="task-card-footer">
                                {task.assigneeId && (
                                    <span>
                                        {getMemberName(
                                            task.assigneeId,
                                            members,
                                        )}
                                    </span>
                                )}

                                {task.dueDate && (
                                    <span>
                                        {new Date(
                                            task.dueDate,
                                        ).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        </article>
                    ),
                )}
            </div>
        </section>
    );
}


function getMemberName(
    userId: string,
    members: ProjectMember[],
) {
    const member = members.find(
        (member) =>
            member.user.id === userId,
    );

    return (
        member?.user.nickName ??
        'Unknown'
    );
}

type ProjectMembersProps = {
    members: ProjectMember[];
};

function ProjectMembers({
    members,
}: ProjectMembersProps) {
    return (
        <aside className="project-members">
            <div className="project-members-header">
                <h2>Members</h2>

                <button
                    type="button"
                    className="add-member-button"
                >
                    +
                </button>
            </div>

            <div className="project-members-list">
                {members.map(
                    (member) => (
                        <div
                            key={member.id}
                            className="project-member"
                        >
                            <div className="project-member-info">
                                <strong>
                                    {
                                        member
                                            .user
                                            .nickName
                                    }
                                </strong>

                                <span>
                                    {
                                        member
                                            .user
                                            .email
                                    }
                                </span>
                            </div>

                            <select
                                value={
                                    member.role
                                }
                                onChange={() => {}}
                            >
                                <option value="OWNER">
                                    Owner
                                </option>

                                <option value="MEMBER">
                                    Member
                                </option>
                            </select>

                            <button
                                type="button"
                                className="delete-member-button"
                            >
                                Delete
                            </button>
                        </div>
                    ),
                )}
            </div>
        </aside>
    );
}

export default Project;
