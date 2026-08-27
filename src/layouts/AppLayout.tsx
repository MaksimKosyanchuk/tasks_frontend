import { Outlet } from 'react-router-dom';

import Header from '../components/Header/Header';
import Sidebar from '../components/Sidebar/Sidebar';

function AppLayout() {
    return (
        <div className="app-layout">
            <Sidebar />

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