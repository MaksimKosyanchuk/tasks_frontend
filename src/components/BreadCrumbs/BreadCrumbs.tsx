import { Link } from 'react-router-dom';


import './BreadCrumbs.css';

type BreadcrumbsProps = {
    currentWorkspace: {
        id: string,
        name: string,
    };

    project?: {
        id: string;
        name: string;
    };
};

function Breadcrumbs({
    currentWorkspace,
    project,
}: BreadcrumbsProps) {
    return (
        <nav className="breadcrumbs">
            <Link to="/workspaces">
                Workspaces
            </Link>

            <span>/</span>

            <Link
                to={`/workspaces/${currentWorkspace.id}`}
            >
                {currentWorkspace.name}
            </Link>

            {project && (
                <>
                    <span>/</span>

                    <Link
                        to={`/workspaces/${currentWorkspace.id}/projects/${project.id}`}
                    >
                        {project.name}
                    </Link>
                </>
            )}
        </nav>
    );
}

export default Breadcrumbs;