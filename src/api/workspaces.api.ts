import { apiFetch } from "./client";

export type WorkspaceMember = {
  id: string;
  role: "OWNER" | "MEMBER";
  userId: string;
  workspaceId: string;
  user: {
    id: string;
    nickName: string;
    email: string;
  };
};

export type Workspace = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  members: WorkspaceMember[];
};

export async function getWorkspaces(accessToken: string) {
  const response = await apiFetch("/workspaces", {}, accessToken);

  if (!response.ok) {
    throw new Error("Failed to load workspaces");
  }

  return response.json() as Promise<Workspace[]>;
}

export async function createWorkspace(name: string, accessToken: string) {
  const response = await apiFetch(
    "/workspaces",
    {
      method: "POST",
      body: JSON.stringify({
        name,
      }),
    },
    accessToken,
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(error.message || "Failed to create workspace");
  }

  return response.json() as Promise<Workspace>;
}

export async function updateWorkspace(
  workspaceId: string,
  name: string,
  accessToken: string,
) {
  const response = await apiFetch(
    `/workspaces/${workspaceId}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        name,
      }),
    },
    accessToken,
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(error.message || "Failed to update workspace");
  }

  return response.json() as Promise<Workspace>;
}

export async function deleteWorkspace(
  workspaceId: string,
  accessToken: string,
) {
  const response = await apiFetch(
    `/workspaces/${workspaceId}`,
    {
      method: "DELETE",
    },
    accessToken,
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(error.message || "Failed to delete workspace");
  }

  return response.json();
}

export async function addMember(
  workspaceId: string,
  email: string,
  accessToken: string,
) {
  const response = await apiFetch(`/workspaces/${workspaceId}/members`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      email,
    }),
  });

  if (!response.ok) {
    const error = await response.json();

    throw new Error(error.message || "Failed to add member");
  }

  return response.json();
}

export type ProjectMember = {
  id: string;
  role: string;
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
  createdAt: string;
  updatedAt: string;
  members: ProjectMember[];
};

export async function getWorkspaceProjects(
  workspaceId: string,
  accessToken: string,
) {
  const response = await apiFetch(`/workspaces/${workspaceId}/projects`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();

    throw new Error(error.message || "Failed to get projects");
  }

  return response.json() as Promise<Project[]>;
}
