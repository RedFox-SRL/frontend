import React from "react";

export default function SpecialEvaluationsView({ type }) {
    return (
        <div className="mt-4 p-4 border rounded-lg shadow-lg bg-white">
            <h3 className="text-2xl font-bold text-purple-700">
                {type === "self" ? "Autoevaluación de Desempeño" : type === "peer" ? "Evaluación de Pares" : "Evaluación Cruzada"}
            </h3>
            <section className="mt-6">
                <h4 className="text-lg font-semibold text-purple-600">Habilidades Técnicas</h4>
                <p className="text-gray-700 mt-1">Conocimiento de Programación</p>
                <textarea className="w-full p-2 mt-2 border rounded-md" placeholder="Tu evaluación sobre Conocimiento de Programación"></textarea>
                <p className="text-gray-700 mt-3">Resolución de Problemas</p>
                <textarea className="w-full p-2 mt-2 border rounded-md" placeholder="Tu evaluación sobre Resolución de Problemas"></textarea>
            </section>
            <section className="mt-6">
                <h4 className="text-lg font-semibold text-purple-600">Habilidades Blandas</h4>
                <p className="text-gray-700 mt-1">Comunicación</p>
                <textarea className="w-full p-2 mt-2 border rounded-md" placeholder="Tu evaluación sobre Comunicación"></textarea>
                <p className="text-gray-700 mt-3">Trabajo en Equipo</p>
                <textarea className="w-full p-2 mt-2 border rounded-md" placeholder="Tu evaluación sobre Trabajo en Equipo"></textarea>
            </section>
        </div>
    );
}
