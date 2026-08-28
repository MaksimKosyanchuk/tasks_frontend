import { useEffect, useState, type DragEvent, type KeyboardEvent } from "react";

import { Navigate, useNavigate, useParams } from "react-router-dom";

import {
  getProject,
  updateProjectMember,
  removeProjectMember,
  type Project as ProjectType,
  type ProjectMember,
  addProjectMember,
} from "../../api/projects.api";

import {
  createTask,
  deleteTask,
  updateTask,
  type Task,
  type TaskStatus,
  type TaskPriority,
} from "../../api/tasks.api";

import { useAuth } from "../../context/useAuth";

import Modal from "../../components/Modal/Modal";
import Breadcrumbs from "../../components/BreadCrumbs/BreadCrumbs";

import "./Project.css";

type TaskField = "title" | "priority" | "assigneeId";

type EditingTaskField = {
  taskId: string;
  field: TaskField;
  value: string;
} | null;

type TaskCreateForm = {
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string;
  assigneeId: string;
};

function Project() {
  const { workspaceId, projectId } = useParams();

  const navigate = useNavigate();

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

  const [memberEmail, setMemberEmail] = useState("");

  const [isInviting, setIsInviting] = useState(false);

  const [memberError, setMemberError] = useState<string | null>(null);

  const { accessToken } = useAuth();

  const currentUserId = getUserIdFromToken(accessToken);

  const [project, setProject] = useState<ProjectType | null>(null);

  const [tasks, setTasks] = useState<Task[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const [editingTask, setEditingTask] = useState<EditingTaskField>(null);

  const [taskCreateForm, setTaskCreateForm] = useState<TaskCreateForm>({
    title: "",
    description: "",
    priority: "MEDIUM",
    dueDate: "",
    assigneeId: "",
  });

  const [isCreatingTask, setIsCreatingTask] = useState(false);

  const [filterStatus, setFilterStatus] = useState<TaskStatus | "ALL">("ALL");

  const [filterPriority, setFilterPriority] = useState<TaskPriority | "ALL">(
    "ALL",
  );

  const [filterAssignee, setFilterAssignee] = useState<string | "ALL">("ALL");

  useEffect(() => {
    if (!accessToken || !workspaceId || !projectId) {
      return;
    }

    getProject(workspaceId, projectId, accessToken)
      .then((project) => {
        setProject(project);
        setTasks(project.tasks);
      })
      .catch(console.error)
      .finally(() => {
        setIsLoading(false);
      });
  }, [accessToken, workspaceId, projectId]);

  if (isLoading) {
    return <div className="project-loading">Loading project...</div>;
  }

  if (!project) {
    return <Navigate to="/workspaces" replace />;
  }

  const filteredTasks = tasks.filter((task) => {
    if (filterStatus !== "ALL" && task.status !== filterStatus) {
      return false;
    }

    if (filterPriority !== "ALL" && task.priority !== filterPriority) {
      return false;
    }

    if (filterAssignee !== "ALL" && task.assigneeId !== filterAssignee) {
      return false;
    }

    return true;
  });

  const resolvePreferredAssignee = () => {
    if (
      currentUserId &&
      project.members.some((member) => member.user.id === currentUserId)
    ) {
      return currentUserId;
    }

    return project.members[0]?.user.id || "";
  };

  const openCreateTaskModal = () => {
    setTaskCreateForm({
      title: "",
      description: "",
      priority: "MEDIUM",
      dueDate: "",
      assigneeId: resolvePreferredAssignee(),
    });

    setIsCreateTaskOpen(true);
  };

  const beginTaskEdit = (task: Task, field: TaskField) => {
    setEditingTask({
      taskId: task.id,
      field,
      value:
        field === "title"
          ? task.title
          : field === "priority"
            ? task.priority
            : (task.assigneeId ?? ""),
    });
  };

  const cancelTaskEdit = () => {
    setEditingTask(null);
  };

  const applyTaskFieldChange = async (
    taskId: string,
    field: TaskField,
    value: string,
  ) => {
    const normalizedValue =
      field === "assigneeId" && value === "" ? null : value;

    const previousTasks = tasks;

    setTasks((currentTasks) =>
      currentTasks.map((task) => {
        if (task.id !== taskId) {
          return task;
        }

        if (field === "title") {
          return {
            ...task,
            title: value,
          };
        }

        if (field === "priority") {
          return {
            ...task,
            priority: value as TaskPriority,
          };
        }

        return {
          ...task,
          assigneeId: normalizedValue,
        };
      }),
    );

    try {
      await updateTask(
        workspaceId!,
        projectId!,
        taskId,
        {
          [field]: normalizedValue,
        } as {
          title?: string;
          priority?: TaskPriority;
          assigneeId?: string | null;
        },
        accessToken!,
      );
    } catch (error) {
      console.error(error);
      setTasks(previousTasks);
    }

    setEditingTask(null);
  };

  const handleTaskTitleSubmit = (task: Task) => {
    if (
      !editingTask ||
      editingTask.taskId !== task.id ||
      editingTask.field !== "title"
    ) {
      return;
    }

    const nextTitle = editingTask.value.trim();

    if (!nextTitle) {
      setEditingTask(null);
      return;
    }

    applyTaskFieldChange(task.id, "title", nextTitle);
  };

  const handleTaskEditKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    task: Task,
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleTaskTitleSubmit(task);
    }

    if (event.key === "Escape") {
      event.preventDefault();
      cancelTaskEdit();
    }
  };

  const handleCreateTask = async () => {
    if (
      !taskCreateForm.title.trim() ||
      !taskCreateForm.dueDate ||
      !taskCreateForm.assigneeId
    ) {
      return;
    }

    setIsCreatingTask(true);

    try {
      const createdTask = await createTask(
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

      setTasks((currentTasks) => [createdTask, ...currentTasks]);

      setIsCreateTaskOpen(false);
      setTaskCreateForm({
        title: "",
        description: "",
        priority: "MEDIUM",
        dueDate: "",
        assigneeId: resolvePreferredAssignee(),
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleAddMember = async () => {
    if (!accessToken || !workspaceId || !projectId || !memberEmail.trim()) {
      return;
    }

    setIsInviting(true);
    setMemberError(null);

    try {
      await addProjectMember(workspaceId, projectId, memberEmail, accessToken);

      setMemberEmail("");
      setIsInviteModalOpen(false);

      const updatedProject = await getProject(
        workspaceId,
        projectId,
        accessToken,
      );

      setProject(updatedProject);
      setTasks(updatedProject.tasks);
    } catch (error) {
      if (error instanceof Error) {
        setMemberError(error.message);
      } else {
        setMemberError("Failed to add member");
      }
    } finally {
      setIsInviting(false);
    }
  };

  const handleChangeRole = async (userId: string, role: "OWNER" | "MEMBER") => {
    await updateProjectMember(
      workspaceId!,
      projectId!,
      userId,
      role,
      accessToken!,
    );

    setProject((prev) => {
      if (!prev) {
        return prev;
      }
      return {
        ...prev,
        members: prev.members.map((member) =>
          member.userId === userId
            ? {
                ...member,
                role,
              }
            : member,
        ),
      };
    });
  };

  const handleRemoveMember = async (userId: string) => {
    await removeProjectMember(workspaceId!, projectId!, userId, accessToken!);

    if (currentUserId && userId === currentUserId) {
      navigate("/workspaces", { replace: true });
      return;
    }

    setProject((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        members: prev?.members.filter((member) => member.user.id !== userId),
      };
    });
  };

  const handleDragStart = (event: DragEvent<HTMLElement>, task: Task) => {
    setDraggedTask(task);

    event.dataTransfer.effectAllowed = "move";

    event.dataTransfer.setData("text/plain", task.id);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
  };

  const handleDrop = async (
    event: DragEvent<HTMLElement>,
    status: TaskStatus,
  ) => {
    event.preventDefault();

    if (!draggedTask || !accessToken) {
      return;
    }

    const previousStatus = draggedTask.status;

    if (previousStatus === status) {
      setDraggedTask(null);
      return;
    }

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === draggedTask.id
          ? {
              ...task,
              status,
            }
          : task,
      ),
    );

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

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === draggedTask.id
            ? {
                ...task,
                status: previousStatus,
              }
            : task,
        ),
      );
    } finally {
      setDraggedTask(null);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const previousTasks = tasks;

    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== taskId),
    );

    try {
      await deleteTask(workspaceId!, projectId!, taskId, accessToken!);
    } catch (error) {
      console.error(error);
      setTasks(previousTasks);
    }
  };

  return (
    <>
      <Breadcrumbs
        currentWorkspace={project.workspace}
        project={{
          id: project.id,
          name: project.name,
        }}
      />

      <section className="project-page">
        <main className="project-content">
          <header className="project-header">
            <div className="project-header-copy">
              <h1>{project.name}</h1>

              {project.description && <p>{project.description}</p>}
            </div>

            <button
              type="button"
              className="create-task-button"
              onClick={openCreateTaskModal}
            >
              + Task
            </button>
          </header>

          <div className="task-filters">
            <select
              value={filterStatus}
              onChange={(event) =>
                setFilterStatus(event.target.value as TaskStatus | "ALL")
              }
            >
              <option value="ALL">All statuses</option>

              <option value="TODO">To Do</option>

              <option value="IN_PROGRESS">In Progress</option>

              <option value="DONE">Done</option>
            </select>

            <select
              value={filterPriority}
              onChange={(event) =>
                setFilterPriority(event.target.value as TaskPriority | "ALL")
              }
            >
              <option value="ALL">All priorities</option>

              <option value="LOW">Low</option>

              <option value="MEDIUM">Medium</option>

              <option value="HIGH">High</option>
            </select>

            <select
              value={filterAssignee}
              onChange={(event) => setFilterAssignee(event.target.value)}
            >
              <option value="ALL">All assignees</option>

              {project.members.map((member) => (
                <option key={member.user.id} value={member.user.id}>
                  {member.user.nickName}
                </option>
              ))}
            </select>
          </div>

          <div className="task-board">
            <TaskColumn
              title="To Do"
              status="TODO"
              tasks={filteredTasks}
              members={project.members}
              editingTask={editingTask}
              onBeginTaskEdit={beginTaskEdit}
              onTaskEditChange={(value) => {
                setEditingTask((current) =>
                  current
                    ? {
                        ...current,
                        value,
                      }
                    : current,
                );
              }}
              onTaskEditCommit={applyTaskFieldChange}
              onTaskEditCancel={cancelTaskEdit}
              onTaskTitleSubmit={handleTaskTitleSubmit}
              onTaskEditKeyDown={handleTaskEditKeyDown}
              onDeleteTask={handleDeleteTask}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
            />

            <TaskColumn
              title="In Progress"
              status="IN_PROGRESS"
              tasks={filteredTasks}
              members={project.members}
              editingTask={editingTask}
              onBeginTaskEdit={beginTaskEdit}
              onTaskEditChange={(value) => {
                setEditingTask((current) =>
                  current
                    ? {
                        ...current,
                        value,
                      }
                    : current,
                );
              }}
              onTaskEditCommit={applyTaskFieldChange}
              onTaskEditCancel={cancelTaskEdit}
              onTaskTitleSubmit={handleTaskTitleSubmit}
              onTaskEditKeyDown={handleTaskEditKeyDown}
              onDeleteTask={handleDeleteTask}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
            />

            <TaskColumn
              title="Done"
              status="DONE"
              tasks={filteredTasks}
              members={project.members}
              editingTask={editingTask}
              onBeginTaskEdit={beginTaskEdit}
              onTaskEditChange={(value) => {
                setEditingTask((current) =>
                  current
                    ? {
                        ...current,
                        value,
                      }
                    : current,
                );
              }}
              onTaskEditCommit={applyTaskFieldChange}
              onTaskEditCancel={cancelTaskEdit}
              onTaskTitleSubmit={handleTaskTitleSubmit}
              onTaskEditKeyDown={handleTaskEditKeyDown}
              onDeleteTask={handleDeleteTask}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
            />
          </div>
        </main>

        <ProjectMembers
          members={project.members}
          onAddMember={() => {
            setIsInviteModalOpen(true);
          }}
          onRoleChange={handleChangeRole}
          onRemoveMember={handleRemoveMember}
        />
      </section>
      <Modal
        isOpen={isInviteModalOpen}
        title="Invite member"
        onClose={() => {
          if (isInviting) {
            return;
          }

          setIsInviteModalOpen(false);
          setMemberEmail("");
          setMemberError(null);
        }}
      >
        <div className="invite-member">
          <label htmlFor="project-member-email">Email</label>

          <input
            id="project-member-email"
            type="email"
            placeholder="member@example.com"
            value={memberEmail}
            onChange={(event) => setMemberEmail(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleAddMember();
              }
            }}
            autoFocus
          />

          {memberError && <p className="invite-member-error">{memberError}</p>}

          <div className="invite-member-actions">
            <button
              type="button"
              onClick={() => {
                setIsInviteModalOpen(false);
                setMemberEmail("");
                setMemberError(null);
              }}
              disabled={isInviting}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleAddMember}
              disabled={isInviting || !memberEmail.trim()}
            >
              {isInviting ? "Inviting..." : "Invite"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isCreateTaskOpen}
        title="Create task"
        onClose={() => {
          setIsCreateTaskOpen(false);
        }}
      >
        <div className="create-task-form">
          <div className="form-field">
            <label htmlFor="task-title">Title</label>

            <input
              id="task-title"
              type="text"
              placeholder="Task title"
              value={taskCreateForm.title}
              onChange={(event) =>
                setTaskCreateForm((currentForm) => ({
                  ...currentForm,
                  title: event.target.value,
                }))
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleCreateTask();
                }
              }}
              autoFocus
            />
          </div>

          <div className="form-field">
            <label htmlFor="task-description">Description</label>

            <textarea
              id="task-description"
              placeholder="Optional description"
              value={taskCreateForm.description}
              onChange={(event) =>
                setTaskCreateForm((currentForm) => ({
                  ...currentForm,
                  description: event.target.value,
                }))
              }
              rows={3}
            />
          </div>

          <div className="task-form-grid">
            <div className="form-field">
              <label htmlFor="task-priority">Priority</label>

              <select
                id="task-priority"
                value={taskCreateForm.priority}
                onChange={(event) =>
                  setTaskCreateForm((currentForm) => ({
                    ...currentForm,
                    priority: event.target.value as TaskPriority,
                  }))
                }
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="task-due-date">Due date</label>

              <input
                id="task-due-date"
                type="date"
                value={taskCreateForm.dueDate}
                onChange={(event) =>
                  setTaskCreateForm((currentForm) => ({
                    ...currentForm,
                    dueDate: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="task-assignee">Assignee</label>

            <select
              id="task-assignee"
              value={taskCreateForm.assigneeId}
              onChange={(event) =>
                setTaskCreateForm((currentForm) => ({
                  ...currentForm,
                  assigneeId: event.target.value,
                }))
              }
            >
              <option value="">Select member</option>

              {project.members.map((member) => (
                <option key={member.user.id} value={member.user.id}>
                  {member.user.nickName}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="modal-button secondary"
              onClick={() => setIsCreateTaskOpen(false)}
            >
              Cancel
            </button>

            <button
              type="button"
              className="modal-button primary"
              onClick={handleCreateTask}
              disabled={
                isCreatingTask ||
                !taskCreateForm.title.trim() ||
                !taskCreateForm.dueDate ||
                !taskCreateForm.assigneeId
              }
            >
              {isCreatingTask ? "Creating..." : "Create"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

type TaskColumnProps = {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  members: ProjectMember[];
  editingTask: EditingTaskField;
  onBeginTaskEdit: (task: Task, field: TaskField) => void;
  onTaskEditChange: (value: string) => void;
  onTaskEditCommit: (taskId: string, field: TaskField, value: string) => void;
  onTaskEditCancel: () => void;
  onTaskTitleSubmit: (task: Task) => void;
  onTaskEditKeyDown: (
    event: KeyboardEvent<HTMLInputElement>,
    task: Task,
  ) => void;
  onDeleteTask: (taskId: string) => void;

  onDragStart: (event: DragEvent<HTMLElement>, task: Task) => void;

  onDragEnd: () => void;

  onDrop: (event: DragEvent<HTMLElement>, status: TaskStatus) => void;
};

function TaskColumn({
  title,
  status,
  tasks,
  members,
  editingTask,
  onBeginTaskEdit,
  onTaskEditChange,
  onTaskEditCommit,
  onTaskEditCancel,
  onTaskTitleSubmit,
  onTaskEditKeyDown,
  onDeleteTask,
  onDragStart,
  onDragEnd,
  onDrop,
}: TaskColumnProps) {
  const columnTasks = tasks.filter((task) => task.status === status);

  return (
    <section
      className="task-column"
      onDragOver={(event) => {
        event.preventDefault();

        event.dataTransfer.dropEffect = "move";
      }}
      onDrop={(event) => onDrop(event, status)}
    >
      <div className="task-column-header">
        <h2>{title}</h2>

        <span>{columnTasks.length}</span>
      </div>

      <div className="task-list">
        {columnTasks.map((task) => (
          <article
            key={task.id}
            className="task-card"
            draggable
            onDragStart={(event) => onDragStart(event, task)}
            onDragEnd={onDragEnd}
          >
            <div className="task-card-header">
              {editingTask?.taskId === task.id &&
              editingTask.field === "title" ? (
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
                <button
                  type="button"
                  className="task-inline-button task-title-button"
                  onClick={() => onBeginTaskEdit(task, "title")}
                >
                  <h3>{task.title}</h3>
                </button>
              )}

              {editingTask?.taskId === task.id &&
              editingTask.field === "priority" ? (
                <select
                  className="task-inline-select task-priority-select"
                  value={editingTask.value}
                  onChange={(event) => {
                    onTaskEditCommit(task.id, "priority", event.target.value);
                  }}
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
                  onClick={() => onBeginTaskEdit(task, "priority")}
                >
                  {task.priority}
                </button>
              )}
            </div>

            {task.description && (
              <p className="task-description">{task.description}</p>
            )}

            <div className="task-card-footer">
              {editingTask?.taskId === task.id &&
              editingTask.field === "assigneeId" ? (
                <select
                  className="task-inline-select task-assignee-select"
                  value={editingTask.value}
                  onChange={(event) => {
                    onTaskEditCommit(task.id, "assigneeId", event.target.value);
                  }}
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
                <button
                  type="button"
                  className="task-inline-button task-assignee-button"
                  onClick={() => onBeginTaskEdit(task, "assigneeId")}
                >
                  {task.assigneeId
                    ? getMemberName(task.assigneeId, members)
                    : "Unassigned"}
                </button>
              )}

              <button
                type="button"
                className="task-delete-button"
                onClick={() => onDeleteTask(task.id)}
              >
                Delete
              </button>

              {task.dueDate && (
                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function getMemberName(userId: string, members: ProjectMember[]) {
  const member = members.find((member) => member.user.id === userId);

  return member?.user.nickName ?? "Unknown";
}

function getUserIdFromToken(token: string | null) {
  if (!token) {
    return null;
  }

  const parts = token.split(".");

  if (parts.length < 2) {
    return null;
  }

  try {
    const payload = JSON.parse(decodeBase64Url(parts[1])) as { sub?: string };

    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");

  return atob(padded);
}

type ProjectMembersProps = {
  members: ProjectMember[];
  onAddMember: () => void;
  onRoleChange: (userId: string, role: "OWNER" | "MEMBER") => void;
  onRemoveMember: (userId: string) => void;
};

function ProjectMembers({
  members,
  onAddMember,
  onRoleChange,
  onRemoveMember,
}: ProjectMembersProps) {
  return (
    <aside className="project-members">
      <div className="project-members-header">
        <div>
          <h2>Members</h2>

          <span className="project-members-count">{members.length}</span>
        </div>

        <button
          type="button"
          className="add-member-button"
          onClick={onAddMember}
          aria-label="Add member"
        >
          +
        </button>
      </div>

      <div className="project-members-list">
        {members.length === 0 ? (
          <p className="no-project-members">No members yet</p>
        ) : (
          members.map((member) => (
            <div key={member.id} className="project-member">
              <div className="project-member-info">
                <strong>{member.user.nickName}</strong>

                <span>{member.user.email}</span>
              </div>

              <select
                value={member.role}
                onChange={(e) =>
                  onRoleChange(
                    member.user.id,
                    e.target.value as "OWNER" | "MEMBER",
                  )
                }
              >
                <option value="OWNER">Owner</option>

                <option value="MEMBER">Member</option>
              </select>

              <button
                type="button"
                className="delete-member-button"
                onClick={() => onRemoveMember(member.user.id)}
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}

export default Project;
