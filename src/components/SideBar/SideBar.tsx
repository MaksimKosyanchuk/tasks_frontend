import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import {
    createWorkspace,
    getWorkspaces,
    type Workspace,
} from '../../api/workspaces.api';

import { useAuth } from '../../context/useAuth';

import Modal from '../Modal/Modal';

import './SideBar.css';

type SidebarProps = {
    currentPath: string;
};

function Sidebar({
    currentPath,
}: SidebarProps) {
    const { accessToken } = useAuth();

    const [workspaces, setWorkspaces] =
        useState<Workspace[]>([]);

    const [isModalOpen, setIsModalOpen] =
        useState(false);

    const [workspaceName, setWorkspaceName] =
        useState('');

    const [isCreating, setIsCreating] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    useEffect(() => {
        if (!accessToken) {
            return;
        }

        getWorkspaces(accessToken)
            .then(setWorkspaces)
            .catch(console.error);
    }, [accessToken]);

    const handleCreateWorkspace = async () => {
        if (
            !accessToken ||
            !workspaceName.trim()
        ) {
            return;
        }

        setIsCreating(true);
        setError(null);

        try {
            const workspace =
                await createWorkspace(
                    workspaceName.trim(),
                    accessToken,
                );

            setWorkspaces((current) => [
                ...current,
                workspace,
            ]);

            setWorkspaceName('');
            setIsModalOpen(false);
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError(
                    'Failed to create workspace',
                );
            }
        } finally {
            setIsCreating(false);
        }
    };

    const handleCloseModal = () => {
        if (isCreating) {
            return;
        }

        setIsModalOpen(false);
        setWorkspaceName('');
        setError(null);
    };

    return (
        <>
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h2>Workspaces</h2>

                    <button
                        type="button"
                        onClick={() =>
                            setIsModalOpen(true)
                        }
                    >
                        +
                    </button>
                </div>

                <div className="sidebar-workspaces">
                    {workspaces.map(
                        (workspace) => {
                            const isActive =
                                currentPath.startsWith(
                                    `/workspaces/${workspace.id}`,
                                );

                            return (
                                <Link
                                    key={
                                        workspace.id
                                    }
                                    to={`/workspaces/${workspace.id}`}
                                    className={
                                        isActive
                                            ? 'sidebar-workspace active'
                                            : 'sidebar-workspace'
                                    }
                                >
                                    {
                                        workspace.name
                                    }
                                </Link>
                            );
                        },
                    )}
                </div>
            </aside>

            <Modal
                isOpen={isModalOpen}
                title="Create workspace"
                onClose={
                    handleCloseModal
                }
            >
                <div className="create-workspace">
                    <label htmlFor="workspace-name">
                        Workspace name
                    </label>

                    <input
                        id="workspace-name"
                        type="text"
                        placeholder="My workspace"
                        value={
                            workspaceName
                        }
                        onChange={(event) =>
                            setWorkspaceName(
                                event.target
                                    .value,
                            )
                        }
                        onKeyDown={(event) => {
                            if (
                                event.key ===
                                'Enter'
                            ) {
                                handleCreateWorkspace();
                            }
                        }}
                        autoFocus
                    />

                    {error && (
                        <p className="create-workspace-error">
                            {error}
                        </p>
                    )}

                    <div className="create-workspace-actions">
                        <button
                            type="button"
                            onClick={
                                handleCloseModal
                            }
                            disabled={
                                isCreating
                            }
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={
                                handleCreateWorkspace
                            }
                            disabled={
                                isCreating ||
                                !workspaceName.trim()
                            }
                        >
                            {isCreating
                                ? 'Creating...'
                                : 'Create'}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}

export default Sidebar;