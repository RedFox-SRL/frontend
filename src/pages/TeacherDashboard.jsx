// src/pages/TeacherPage.jsx
import React, { useState } from 'react'
import Layout from '../components/Layout'
import DashboardTeacher from '../components/DashboardTeacher'
//import Ajustes from '../components/Ajustes'
import Perfil from '../components/Perfil'
//import Grupos from "@/components/Grupos";

export default function TeacherDashboard() {
    const [currentView, setCurrentView] = useState('inicio')

    const renderContent = () => {
        switch (currentView) {
            case 'inicio':
                return <DashboardTeacher />
            //case 'grupos':
            //  return <Grupos />
            case 'ajustes':
                return <Perfil />
            default:
                return <DashboardTeacher />
        }
    }

    return (
        <Layout setCurrentView={setCurrentView}>
            {renderContent()}
        </Layout>
    )
}