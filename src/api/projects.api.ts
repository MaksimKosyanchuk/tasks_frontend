import { apiFetch } from "./client";

import type { Task } from "./tasks.api";

export type ProjectRole = 'OWNER' | 'MEMBER';

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
        id: string,
        name: string
    }
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
            method: "GET"
        },
        accessToken
    )

    if (!response.ok) {
        throw new Error(
            'Failed to get project',
        );
    }

    return response.json();
}
