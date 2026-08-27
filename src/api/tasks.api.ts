import type { Project } from "./workspaces.api";
import { apiFetch } from "./client";

export type TaskStatus =
    | 'TODO'
    | 'IN_PROGRESS'
    | 'DONE';

export type TaskPriority =
    | 'LOW'
    | 'MEDIUM'
    | 'HIGH';

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


export async function getProject(
    workspaceId: string,
    projectId: string,
    accessToken: string,
): Promise<Project> {
    const response = await apiFetch(
        `/workspaces/${workspaceId}/projects/${projectId}`,
        {
            
        },
        accessToken
    );

    if (!response.ok) {
        throw new Error(
            'Failed to get project',
        );
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
            method: 'PATCH',
            body: JSON.stringify(data),
        },
        accessToken
    );

    if (!response.ok) {
        throw new Error(
            'Failed to update task',
        );
    }

    return response.json();
}
