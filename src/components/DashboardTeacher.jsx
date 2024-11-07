import React, { useEffect, useState } from "react";
import { getData } from "../api/apiService";
import CreateManagement from "./CreateManagement";
import ManagementList from "./ManagementList";
import ManagementView from "./ManagementView";

export default function DashboardTeacher() {
  const [isLoading, setIsLoading] = useState(true);
  const [managements, setManagements] = useState([]);
  const [selectedManagement, setSelectedManagement] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchManagements = async () => {
    setIsLoading(true);
    try {
      const response = await getData("/managements");
      if (response && response.success && Array.isArray(response.data.items)) {
        setManagements(response.data.items);
        const currentManagement = response.data.items.find((management) => {
          const currentDate = new Date();
          const start = new Date(management.start_date);
          const end = new Date(management.end_date);
          return currentDate >= start && currentDate <= end;
        });
        if (currentManagement) setSelectedManagement(currentManagement);
      } else {
        setManagements([]);
      }
    } catch (error) {
      console.error("Error al cargar las gestiones:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchManagements();
  }, []);

  const handleManagementCreated = () => {
    fetchManagements();
    setShowCreateForm(false);
  };

  const handleCancelCreateManagement = () => {
    setShowCreateForm(false);
  };

  const handleBackToList = () => {
    setSelectedManagement(null);
  };

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-screen">
          <span>Cargando...</span>
        </div>
    );
  }

  if (showCreateForm) {
    return (
        <CreateManagement
            onManagementCreated={handleManagementCreated}
            onCancel={handleCancelCreateManagement}
        />
    );
  }

  if (selectedManagement) {
    return (
        <ManagementView
            management={selectedManagement}
            onBack={handleBackToList}
        />
    );
  }

  return (
      <ManagementList
          managements={managements}
          onSelectManagement={(management) => setSelectedManagement(management)}
          onCreateNew={() => setShowCreateForm(true)}
      />
  );
}
