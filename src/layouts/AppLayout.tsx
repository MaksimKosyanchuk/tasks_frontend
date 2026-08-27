import { Outlet, useLocation } from 'react-router-dom';

import Header from '../components/Header/Header';
import Sidebar from '../components/SideBar/SideBar';

import './AppLayout.css';

function AppLayout() {
    const location = useLocation();

    return (
        <div className="app-layout">
            <Sidebar
                currentPath={location.pathname}
            />

            <div className="app-content">
                <Header />

                <main>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default AppLayout;