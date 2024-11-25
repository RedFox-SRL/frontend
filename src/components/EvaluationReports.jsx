import React, { useState } from "react";
import EvaluationDetails from "./EvaluationDetails";

const EvaluationReports = () => {
    const [selectedMember, setSelectedMember] = useState(null);

    const handleDetailsClick = (memberName) => {
        setSelectedMember(memberName);
    };

    const handleBack = () => {
        setSelectedMember(null);
    };

    if (selectedMember) {
        return <EvaluationDetails memberName={selectedMember} onBack={handleBack} />;
    }

    return (
        <div className="bg-purple-100 min-h-screen flex flex-col items-center p-6">
            <h1 className="text-purple-700 font-bold text-2xl mb-4">Reportes de evaluaciones</h1>
            <table className="w-full max-w-4xl bg-white border border-purple-300 rounded-lg shadow-md">
                <thead>
                <tr className="bg-purple-200 text-purple-700">
                    <th className="py-2 px-4 text-left">Estado</th>
                    <th className="py-2 px-4 text-left">Grupo</th>
                    <th className="py-2 px-4 text-left">Calificación</th>
                    <th className="py-2 px-4 text-left">Detalle</th>
                </tr>
                </thead>
                <tbody>
                {[
                    { status: "Completado", group: "Parte A", grade: "08/10" },
                    { status: "Completado", group: "Parte B", grade: "10/15" },
                    { status: "En progreso", group: "Integrante 1", grade: "48/60" },
                ].map((item, index) => (
                    <tr
                        key={index}
                        className={`${
                            index % 2 === 0 ? "bg-purple-50" : "bg-white"
                        } hover:bg-purple-100`}
                    >
                        <td className="py-2 px-4">{item.status}</td>
                        <td className="py-2 px-4">{item.group}</td>
                        <td className="py-2 px-4 font-bold text-purple-600">{item.grade}</td>
                        <td className="py-2 px-4">
                            <button
                                onClick={() => handleDetailsClick(item.group)}
                                className="bg-purple-500 text-white px-4 py-2 rounded-md shadow hover:bg-purple-600"
                            >
                                Detalles
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default EvaluationReports;