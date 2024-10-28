// src/pages/UnauthorizedPage.jsx
import React from "react";

const UnauthorizedPage = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <h1 className="text-3xl font-semibold text-red-500">
        Acceso no autorizado
      </h1>
      <p className="text-lg">No tienes permiso para acceder a esta página.</p>
    </div>
  );
};

export default UnauthorizedPage;
