import React from 'react';
import Sidebar from '../Sidebar.jsx';
import Navbar from '../Navbar.jsx';

const MainLayout = ({ children }) => {
    return (
        <div className="flex">
            <Sidebar />
            <div className="flex flex-col flex-grow">
                <Navbar />
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default MainLayout;
