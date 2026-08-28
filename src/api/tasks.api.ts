import { apiFetch } from "./client";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  projectId: string;
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TaskPage = {
  items: Task[];
  nextCursor: string | null;
  hasMore: boolean;
};

export type TaskComment = {
  id: string;
  content: string;
  taskId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    nickName: string;
    email: string;
  };
};

export type TaskStatusHistoryItem = {
  id: string;
  taskId: string;
  changedById: string;
  oldStatus: TaskStatus;
  newStatus: TaskStatus;
  createdAt: string;
  changedBy: {
    id: string;
    nickName: string;
    email: string;
  };
};

export async function listTasks(
    workspaceId: string,
    projectId: string,
    accessToken: string,
    params: {
        cursor?: string | null;
        limit?: number;
        status?: TaskStatus;
        priority?: TaskPriority;
        assigneeId?: string;
    } = {},
): Promise<TaskPage> {
    const searchParams = new URLSearchParams();

    if (params.cursor) {
        searchParams.set("cursor", params.cursor);
    }

    if (params.limit) {
        searchParams.set("limit", String(params.limit));
    }

    if (params.status) {
        searchParams.set("status", params.status);
    }

    if (params.priority) {
        searchParams.set("priority", params.priority);
    }

    if (params.assigneeId) {
        searchParams.set("assigneeId", params.assigneeId);
    }

    const response = await apiFetch(
        `/workspaces/${workspaceId}/projects/${projectId}/tasks${
            searchParams.toString()
                ? `?${searchParams.toString()}`
                : ""
        }`,
        {},
        accessToken,
    );

    if (!response.ok) {
        const error = await response.json();

        throw new Error(error.message || "Failed to load tasks");
    }

    return response.json();
}

export async function createTask(
  workspaceId: string,
  projectId: string,
  data: {
    title: string;
    description?: string;
    priority?: TaskPriority;
    dueDate: string;
    assigneeId: string;
  },
  accessToken: string,
): Promise<Task> {
  const response = await apiFetch(
    `/workspaces/${workspaceId}/projects/${projectId}/tasks`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    accessToken,
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(error.message || "Failed to create task");
  }

  return response.json();
}

export async function updateTask(
  workspaceId: string,
  projectId: string,
  taskId: string,
  data: {
    status?: TaskStatus;
    title?: string;
    description?: string;
    priority?: TaskPriority;
    assigneeId?: string | null;
    dueDate?: string | null;
  },
  accessToken: string,
): Promise<Task> {
  const response = await apiFetch(
    `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
    accessToken,
  );

  if (!response.ok) {
    throw new Error("Failed to update task");
  }

  return response.json();
}

export async function deleteTask(
  workspaceId: string,
  projectId: string,
  taskId: string,
  accessToken: string,
) {
  const response = await apiFetch(
    `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`,
    {
      method: "DELETE",
    },
    accessToken,
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(error.message || "Failed to delete task");
  }

  return response.json();
}

export async function getTaskHistory(
  workspaceId: string,
  projectId: string,
  taskId: string,
  accessToken: string,
): Promise<TaskStatusHistoryItem[]> {
  const response = await apiFetch(
    `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/history`,
    {},
    accessToken,
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(error.message || "Failed to load task history");
  }

  return response.json();
}

export async function listTaskComments(
  workspaceId: string,
  projectId: string,
  taskId: string,
  accessToken: string,
): Promise<TaskComment[]> {
  const response = await apiFetch(
    `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments`,
    {},
    accessToken,
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(error.message || "Failed to load comments");
  }

  return response.json();
}

export async function createTaskComment(
  workspaceId: string,
  projectId: string,
  taskId: string,
  content: string,
  accessToken: string,
): Promise<TaskComment> {
  const response = await apiFetch(
    `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments`,
    {
      method: "POST",
      body: JSON.stringify({ content }),
    },
    accessToken,
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(error.message || "Failed to create comment");
  }

  return response.json();
}

export async function updateTaskComment(
  workspaceId: string,
  projectId: string,
  taskId: string,
  commentId: string,
  content: string,
  accessToken: string,
): Promise<TaskComment> {
  const response = await apiFetch(
    `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments/${commentId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ content }),
    },
    accessToken,
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(error.message || "Failed to update comment");
  }

  return response.json();
}

export async function deleteTaskComment(
  workspaceId: string,
  projectId: string,
  taskId: string,
  commentId: string,
  accessToken: string,
) {
  const response = await apiFetch(
    `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments/${commentId}`,
    {
      method: "DELETE",
    },
    accessToken,
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(error.message || "Failed to delete comment");
  }

  return response.json();
}
