import { Link } from 'react-router-dom';

import type {
    Workspace,
} from '../../api/workspaces.api';

import './BreadCrumbs.css';

type BreadcrumbsProps = {
    currentWorkspace: Workspace;
};

function Breadcrumbs({
    currentWorkspace,
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
        </nav>
    );
}

export default Breadcrumbs;