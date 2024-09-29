import React, { useState } from 'react'
import Layout from '../components/Layout'
import Dashboard from '../components/Dashboard'
import GruposYPlanificacion from '../components/GruposYPlanificacion'
import Perfil from '../components/Perfil'
import TeamsTable from "../components/TeamsTable";
import { UserProvider } from '../context/UserContext'

export default function StudentDashboard() {
    const [currentView, setCurrentView] = useState('inicio')

    const renderContent = () => {
        switch (currentView) {
            case 'inicio':
                return <Dashboard/>
            case 'grupo':
                return <GruposYPlanificacion/>
            case 'perfil':
                return <Perfil/>
            case 'empresas':
                return <TeamsTable/>
            default:
                return <Dashboard/>
        }
    }

    return (
        <UserProvider>
            <Layout setCurrentView={setCurrentView}>
                {renderContent()}
            </Layout>
        </UserProvider>
    )
}