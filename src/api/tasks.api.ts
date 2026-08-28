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
