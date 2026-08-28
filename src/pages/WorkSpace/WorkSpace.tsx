import { useEffect, useState } from 'react';
import {
    useParams,
} from 'react-router-dom';

import {
    addMember,
    getWorkspaceProjects,
    getWorkspaces,
    type Project,
    type Workspace as WorkspaceType,
} from '../../api/workspaces.api';

import { createProject } from '../../api/projects.api';

import { useAuth } from '../../context/useAuth';

import ProjectCard from '../../components/ProjectCard/ProjectCard';
import Breadcrumbs from '../../components/BreadCrumbs/BreadCrumbs';
import Modal from '../../components/Modal/Modal';

import './WorkSpace.css';

function Workspace() {
    const { workspaceId } = useParams();
    const { accessToken } = useAuth();

    const [currentWorkspace, setCurrentWorkspace] =
        useState<WorkspaceType | null>(null);
    
    const [projects, setProjects] =
        useState<Project[]>([]);

    const [isCreateProjectOpen, setIsCreateProjectOpen] =
        useState(false);

    const [projectName, setProjectName] =
        useState('');

    const [projectDescription, setProjectDescription] =
        useState('');

    const [isCreatingProject, setIsCreatingProject] =
        useState(false);    

    const [isInviteModalOpen, setIsInviteModalOpen] =
        useState(false);

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
            setIsInviteModalOpen(false);

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

    const handleCreateProject = async () => {
        if (
            !accessToken ||
            !workspaceId ||
            !projectName.trim()
        ) {
            return;
        }

        setIsCreatingProject(true);

        const data = {
            name: projectName.trim(),
            description:
                projectDescription.trim() || undefined,
        };

        const result = await createProject(workspaceId, data, accessToken)
        console.log(result)
        setProjects((prev) => [
            ...prev,
            result
        ])

        setProjectName('');
        setProjectDescription('');

        setIsCreatingProject(false);
        setIsCreateProjectOpen(false);
    };

    if(!workspaceId) {
        return null
    }

    if (!currentWorkspace) {
        return null;
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
                        <div className="workspace-projects-header">
                            <h2>Projects</h2>

                            <button
                                type="button"
                                className="add-project-button"
                                onClick={() =>
                                    setIsCreateProjectOpen(true)
                                }
                            >
                                +
                            </button>
                        </div>

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
                        <button
                            type="button"
                            onClick={() =>
                                setIsInviteModalOpen(true)
                            }
                        >
                            Invite member
                        </button>
                    </div>
                </aside>
            </section>
            <Modal
                isOpen={isInviteModalOpen}
                title="Invite member"
                onClose={() => {
                    if (isInviting) {
                        return;
                    }

                    setIsInviteModalOpen(false);
                    setEmail('');
                    setError(null);
                }}
            >
                <div className="invite-member">
                    <label htmlFor="member-email">
                        Email
                    </label>

                    <input
                        id="member-email"
                        type="email"
                        placeholder="member@example.com"
                        value={email}
                        onChange={(event) =>
                            setEmail(event.target.value)
                        }
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                handleInvite();
                            }
                        }}
                        autoFocus
                    />

                    {error && (
                        <p className="invite-member-error">
                            {error}
                        </p>
                    )}

                    <div className="invite-member-actions">
                        <button
                            type="button"
                            onClick={() => {
                                setIsInviteModalOpen(false);
                                setEmail('');
                                setError(null);
                            }}
                            disabled={isInviting}
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={handleInvite}
                            disabled={
                                isInviting ||
                                !email.trim()
                            }
                        >
                            {isInviting
                                ? 'Inviting...'
                                : 'Invite'}
                        </button>
                    </div>
                </div>
            </Modal>
            <Modal
                isOpen={isCreateProjectOpen}
                title="Create project"
                onClose={() => {
                    if (!isCreatingProject) {
                        setIsCreateProjectOpen(false);
                    }
                }}
            >
                <div className="create-project-form">
                    <div className="form-field">
                        <label htmlFor="project-name">
                            Name
                        </label>

                        <input
                            id="project-name"
                            type="text"
                            placeholder="Project name"
                            value={projectName}
                            onChange={(event) =>
                                setProjectName(
                                    event.target.value,
                                )
                            }
                            autoFocus
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="project-description">
                            Description
                        </label>

                        <textarea
                            id="project-description"
                            placeholder="Optional description"
                            value={projectDescription}
                            onChange={(event) =>
                                setProjectDescription(
                                    event.target.value,
                                )
                            }
                            rows={4}
                        />
                    </div>

                    <div className="modal-actions">
                        <button
                            type="button"
                            className="modal-button secondary"
                            onClick={() =>
                                setIsCreateProjectOpen(false)
                            }
                            disabled={isCreatingProject}
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            className="modal-button primary"
                            onClick={handleCreateProject}
                            disabled={
                                isCreatingProject ||
                                !projectName.trim()
                            }
                        >
                            {isCreatingProject
                                ? 'Creating...'
                                : 'Create project'}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}

export default Workspace;