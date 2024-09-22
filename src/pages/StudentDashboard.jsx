import React, { useState } from 'react'
import Layout from '../components/Layout'
import Dashboard from '../components/Dashboard'
import GruposYPlanificacion from '../components/GruposYPlanificacion'
import Ajustes from '../components/Ajustes'

export default function StudentDashboard() {
  const [currentView, setCurrentView] = useState('inicio')

  const renderContent = () => {
    switch (currentView) {
      case 'inicio':
        return <Dashboard />
      case 'grupos':
        return <GruposYPlanificacion />
      case 'ajustes':
        return <Ajustes />
      default:
        return <Dashboard />
    }
  }

  return (
    <Layout setCurrentView={setCurrentView}>
      {renderContent()}
    </Layout>
  )
}