import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import {
    getWorkspaces,
    type Workspace,
} from '../../api/workspaces.api';

import { useAuth } from '../../context/useAuth';

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

    useEffect(() => {
        if (!accessToken) {
            return;
        }

        getWorkspaces(accessToken)
            .then(setWorkspaces)
            .catch(console.error)
    }, [accessToken]);

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h2>Workspaces</h2>

                <button type="button">
                    +
                </button>
            </div>

            <div className="sidebar-workspaces">
                {workspaces && (
                    workspaces.map((workspace) => {
                        const isActive =
                            currentPath.startsWith(
                                `/workspaces/${workspace.id}`,
                            );

                        return (
                            <Link
                                key={workspace.id}
                                to={`/workspaces/${workspace.id}`}
                                className={
                                    isActive
                                        ? 'sidebar-workspace active'
                                        : 'sidebar-workspace'
                                }
                            >
                                {workspace.name}
                            </Link>
                        );
                    })
                )}
            </div>
        </aside>
    );
}

export default Sidebar;