import { useEffect, useState } from 'react';
import {
    Navigate,
    useParams,
} from 'react-router-dom';

import {
    addMember,
    getWorkspaceProjects,
    getWorkspaces,
    type Project,
    type Workspace as WorkspaceType,
} from '../../api/workspaces.api';

import { useAuth } from '../../context/useAuth';

import ProjectCard from '../../components/ProjectCard/ProjectCard';
import Breadcrumbs from '../../components/BreadCrumbs/BreadCrumbs';

import './WorkSpace.css';

function Workspace() {
    const { workspaceId } = useParams();
    const { accessToken } = useAuth();

    const [currentWorkspace, setCurrentWorkspace] =
        useState<WorkspaceType | null>(null);

    const [projects, setProjects] =
        useState<Project[]>([]);

    const [email, setEmail] = useState('');

    const [isInviting, setIsInviting] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);


    useEffect(() => {
        if (!accessToken || !workspaceId) {
            return;
        }

        getWorkspaces(accessToken)
            .then((workspaces) => {
                const workspace = workspaces.find(
                    (workspace) =>
                        workspace.id === workspaceId,
                );

                setCurrentWorkspace(
                    workspace ?? null,
                );
            })
            .catch((error) => {
                console.error(error);
                setCurrentWorkspace(null);
            });
    }, [accessToken, workspaceId]);


    useEffect(() => {
        if (!accessToken || !workspaceId) {
            return;
        }

        getWorkspaceProjects(
            workspaceId,
            accessToken,
        )
            .then(setProjects)
            .catch((error) => {
                console.error(error);
                setProjects([]);
            });
    }, [accessToken, workspaceId]);

    const handleInvite = async () => {
        if (
            !accessToken ||
            !workspaceId ||
            !email.trim()
        ) {
            return;
        }

        setIsInviting(true);
        setError(null);

        try {
            await addMember(
                workspaceId,
                email.trim(),
                accessToken,
            );

            setEmail('');

            const workspaces =
                await getWorkspaces(accessToken);

            const workspace = workspaces.find(
                (workspace) =>
                    workspace.id === workspaceId,
            );

            setCurrentWorkspace(
                workspace ?? null,
            );
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError(
                    'Failed to add member',
                );
            }
        } finally {
            setIsInviting(false);
        }
    };

    if (!currentWorkspace) {
        return (
            <Navigate
                to="/workspaces"
                replace
            />
        );
    }

    return (
        <>
            <Breadcrumbs
                currentWorkspace={currentWorkspace}
            />

            <section className="workspace-page">
                <div className="workspace-content">
                    <h1>
                        {currentWorkspace.name}
                    </h1>

                    <p>
                        Workspace ID:{' '}
                        {currentWorkspace.id}
                    </p>

                    <section className="workspace-projects">
                        <h2>Projects</h2>

                        {projects && projects.length === 0 ? (
                            <p>
                                No projects yet
                            </p>
                        ) : (
                            <div className="projects-list">
                                {projects.map(
                                    (project) => (
                                        <ProjectCard
                                            key={
                                                project.id
                                            }
                                            project={
                                                project
                                            }
                                        />
                                    ),
                                )}
                            </div>
                        )}
                    </section>
                </div>

                <aside className="workspace-members">
                    <h2>Members</h2>

                    <div className="members-list">
                        {currentWorkspace.members.map(
                            (member) => (
                                <p
                                    key={
                                        member.id
                                    }
                                >
                                    {
                                        member.user
                                            .nickName
                                    }
                                </p>
                            ),
                        )}
                    </div>

                    <div className="workspace-invite">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(
                                event,
                            ) =>
                                setEmail(
                                    event.target
                                        .value,
                                )
                            }
                        />

                        <button
                            type="button"
                            onClick={
                                handleInvite
                            }
                            disabled={
                                isInviting
                            }
                        >
                            {isInviting
                                ? 'Inviting...'
                                : 'Invite'}
                        </button>

                        {error && (
                            <p>{error}</p>
                        )}
                    </div>
                </aside>
            </section>
        </>
    );
}

export default Workspace;