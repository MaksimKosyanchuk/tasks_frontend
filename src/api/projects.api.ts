import { apiFetch } from "./client";

import type { Task } from "./tasks.api";

export type ProjectRole = "OWNER" | "MEMBER";

export type ProjectMember = {
  id: string;
  role: ProjectRole;
  userId: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    nickName: string;
    email: string;
  };
};

export type Project = {
  id: string;
  name: string;
  description: string | null;
  workspaceId: string;
  workspace: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  members: ProjectMember[];
  tasks: Task[];
};

export async function getProject(
  workspaceId: string,
  projectId: string,
  accessToken: string,
): Promise<Project> {
  const response = await apiFetch(
    `/workspaces/${workspaceId}/projects/${projectId}`,
    {
      method: "GET",
    },
    accessToken,
  );

  if (!response.ok) {
    throw new Error("Failed to get project");
  }

  return response.json();
}

export async function createProject(
  workspaceId: string,
  data: {
    name: string;
    description?: string;
  },
  accessToken: string,
) {
  const response = await apiFetch(
    `/workspaces/${workspaceId}/projects`,
    {
      method: "Post",
      body: JSON.stringify(data),
    },
    accessToken,
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(error.message || "Failed to create project");
  }
  return response.json();
}

export async function updateProject(
  workspaceId: string,
  projectId: string,
  data: {
    name?: string;
    description?: string | null;
  },
  accessToken: string,
) {
  const response = await apiFetch(
    `/workspaces/${workspaceId}/projects/${projectId}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
    accessToken,
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(error.message || "Failed to update project");
  }

  return response.json();
}

export async function deleteProject(
  workspaceId: string,
  projectId: string,
  accessToken: string,
) {
  const response = await apiFetch(
    `/workspaces/${workspaceId}/projects/${projectId}`,
    {
      method: "DELETE",
    },
    accessToken,
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(error.message || "Failed to delete project");
  }

  return response.json();
}

export async function addProjectMember(
  workspaceId: string,
  projectId: string,
  email: string,
  accessToken: string,
) {
  const response = await apiFetch(
    `/workspaces/${workspaceId}/projects/${projectId}/members`,
    {
      method: "POST",
      body: JSON.stringify({
        email,
      }),
    },
    accessToken,
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(error.message || "Failed to add member");
  }
}

export async function updateProjectMember(
  workspaceId: string,
  projectId: string,
  userId: string,
  role: "OWNER" | "MEMBER",
  accessToken: string,
) {
  const response = await apiFetch(
    `/workspaces/${workspaceId}/projects/${projectId}/members/${userId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ role: role }),
    },
    accessToken,
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(error.message || "Failed to update role");
  }

  return response.json();
}

export async function removeProjectMember(
  workspaceId: string,
  projectId: string,
  userId: string,
  accessToken: string,
) {
  const response = await apiFetch(
    `/workspaces/${workspaceId}/projects/${projectId}/members/${userId}`,
    {
      method: "DELETE",
      body: JSON.stringify({ userId: userId }),
    },
    accessToken,
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(error.message || "Failed to remove member");
  }
}
