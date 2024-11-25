import React from "react";

const EvaluationDetails = ({ memberName, onBack }) => {
    const data = [
        {
            status: "Completado",
            evaluation: "Evaluación Sprint",
            sprint: "Primer Sprint",
            assignedDate: "13/08/2024",
            dueDate: "17/08/2024",
            grade: "8/10",
        },
        {
            status: "Completado",
            evaluation: "Autoevaluación",
            sprint: "Primer Sprint",
            assignedDate: "17/09/2024",
            dueDate: "21/09/2024",
            grade: "2/3",
        },
        {
            status: "Sin entregar",
            evaluation: "Evaluación en Pares",
            sprint: "Primer Sprint",
            assignedDate: "02/12/2024",
            dueDate: "21/09/2024",
            grade: "2/2",
        },
        {
            status: "Completado",
            evaluation: "Evaluación Sprint",
            sprint: "Segundo Sprint",
            assignedDate: "02/12/2024",
            dueDate: "06/12/2024",
            grade: "8/10",
        },
        {
            status: "Completado",
            evaluation: "Autoevaluación",
            sprint: "Segundo Sprint",
            assignedDate: "07/10/2024",
            dueDate: "10/10/2024",
            grade: "2/3",
        },
        {
            status: "Sin entregar",
            evaluation: "Evaluación en Pares",
            sprint: "Segundo Sprint",
            assignedDate: "07/10/2024",
            dueDate: "10/10/2024",
            grade: "2/2",
        },
        {
            status: "Completado",
            evaluation: "Evaluación Sprint",
            sprint: "Tercer Sprint",
            assignedDate: "07/10/2024",
            dueDate: "10/10/2024",
            grade: "8/10",
        },
        {
            status: "En progreso",
            evaluation: "Autoevaluación",
            sprint: "Tercer Sprint",
            assignedDate: "07/10/2024",
            dueDate: "10/10/2024",
            grade: "2/3",
        },
        {
            status: "En progreso",
            evaluation: "Evaluación en Pares",
            sprint: "Tercer Sprint",
            assignedDate: "07/10/2024",
            dueDate: "10/10/2024",
            grade: "2/2",
        },
    ];

    return (
        <div className="bg-purple-100 min-h-screen p-6">
            <button
                onClick={onBack}
                className="flex items-center mb-4 bg-purple-500 text-white px-4 py-2 rounded-md shadow hover:bg-purple-600"
            >
                <span className="mr-2">←</span> Volver
            </button>
            <h1 className="text-purple-700 font-bold text-2xl mb-4">Reportes de evaluaciones</h1>
            <h2 className="text-purple-700 font-semibold text-xl mb-4">{memberName}</h2>
            <table className="w-full bg-white border border-purple-300 rounded-lg shadow-md">
                <thead>
                <tr className="bg-purple-200 text-purple-700">
                    <th className="py-2 px-4 text-left">Estado</th>
                    <th className="py-2 px-4 text-left">Evaluación</th>
                    <th className="py-2 px-4 text-left">Sprint</th>
                    <th className="py-2 px-4 text-left">Fecha de asignación</th>
                    <th className="py-2 px-4 text-left">Fecha de entrega</th>
                    <th className="py-2 px-4 text-left">Calificación</th>
                </tr>
                </thead>
                <tbody>
                {data.map((item, index) => (
                    <tr
                        key={index}
                        className={`${
                            index % 2 === 0 ? "bg-purple-50" : "bg-white"
                        } hover:bg-purple-100`}
                    >
                        <td className="py-2 px-4">{item.status}</td>
                        <td className="py-2 px-4">{item.evaluation}</td>
                        <td className="py-2 px-4">{item.sprint}</td>
                        <td className="py-2 px-4">{item.assignedDate}</td>
                        <td className="py-2 px-4">{item.dueDate}</td>
                        <td className="py-2 px-4 font-bold text-purple-600">{item.grade}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default EvaluationDetails;