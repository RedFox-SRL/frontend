import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProposalsView({ onBack }) {
    const [groups, setGroups] = useState([
        {
            id: 1,
            name: "Grupo 1",
            proposals: [
                { part: "Parte A", file: "Grupo1ParteA.pdf", score: 10, maxScore: 10 },
                { part: "Parte B", file: "Grupo1ParteB.pdf", score: 20, maxScore: 20 },
            ],
        },
        {
            id: 2,
            name: "Grupo 2",
            proposals: [
                { part: "Parte A", file: "Grupo2ParteA.pdf", score: 8, maxScore: 10 },
                { part: "Parte B", file: "Grupo2ParteB.pdf", score: 15, maxScore: 20 },
            ],
        },
    ]);

    return (
        <div className="mt-4 p-4 border rounded-lg shadow-lg bg-white space-y-6">
            {/* Botón para retroceder */}
            <button onClick={onBack} className="flex items-center text-purple-600 mb-4">
                <ArrowLeft className="mr-2" /> Retroceder
            </button>

            <h1 className="text-2xl font-bold text-purple-700 mb-6">Propuestas de Grupos</h1>

            {/* Resumen de progreso por partes */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 border border-purple-300 rounded-md">
                    <h2 className="text-lg font-bold text-purple-700">Parte A</h2>
                    <p className="text-4xl text-purple-500 font-bold">50%</p>
                    <p className="text-sm text-purple-400">/100</p>
                </div>
                <div className="p-4 border border-purple-300 rounded-md">
                    <h2 className="text-lg font-bold text-purple-700">Parte B</h2>
                    <p className="text-4xl text-purple-500 font-bold">60%</p>
                    <p className="text-sm text-purple-400">/100</p>
                </div>
            </div>

            {/* Listado de grupos */}
            {groups.map((group) => (
                <div key={group.id} className="mb-4 border border-purple-200 rounded-md">
                    {/* Cabecera del grupo */}
                    <div className="flex items-center justify-between p-4 bg-purple-100 rounded-t-md">
                        <h3 className="text-lg font-bold text-purple-700">{group.name}</h3>
                    </div>

                    {/* Propuestas del grupo */}
                    <div className="p-4 space-y-4">
                        {group.proposals.map((proposal, index) => (
                            <div key={index} className="flex justify-between items-center">
                                <div className="flex items-center space-x-4">
                                    <span className="font-semibold">{proposal.part}</span>
                                    <a
                                        href="#"
                                        className="text-purple-500 hover:underline"
                                    >
                                        {proposal.file}
                                    </a>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <span>
                                        {proposal.score}/{proposal.maxScore}
                                    </span>
                                    <Button className="bg-purple-500 text-white hover:bg-purple-600">
                                        Evaluar
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}