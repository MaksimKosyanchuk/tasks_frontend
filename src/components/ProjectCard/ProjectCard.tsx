import { useNavigate } from 'react-router-dom';

import type { Project } from '../../api/workspaces.api';

import './ProjectCard.css';

type ProjectCardProps = {
    project: Project;
};

function ProjectCard({ project }: ProjectCardProps) {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(
            `/workspaces/${project.workspaceId}/projects/${project.id}`,
        );
    };

    return (
        <article
            className="project-card"
            onClick={handleClick}
        >
            <h3>{project.name}</h3>

            {project.description && (
                <p>{project.description}</p>
            )}

            <span>
                Members: {project.members.length}
            </span>
        </article>
    );
}

export default ProjectCard;