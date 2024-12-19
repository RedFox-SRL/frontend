import React from 'react';
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {PieChart, Pie, Cell, ResponsiveContainer} from 'recharts';

const HelpDialog = ({isOpen, onClose, scoreConfiguration, sprintComposition}) => {
    const data = [{name: 'Sprints', value: scoreConfiguration.sprints}, {
        name: 'Propuesta', value: scoreConfiguration.proposal
    }, {name: 'Eval. Cruzada', value: scoreConfiguration.cross_evaluation},];

    const COLORS = ['#8884d8', '#82ca9d', '#ffc658'];

    const sprintData = [{name: 'Docente', value: sprintComposition.teacher}, {
        name: 'Auto', value: sprintComposition.self
    }, {name: 'Pares', value: sprintComposition.peer},];

    return (<Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
            className="bg-white p-4 sm:p-6 rounded-lg w-[95vw] sm:w-[90vw] max-w-3xl mx-auto overflow-y-auto max-h-[80vh]">
            <DialogHeader>
                <DialogTitle className="text-purple-700 font-bold text-lg sm:text-xl mb-4">Estructura de
                    Calificaciones</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
                <p className="text-sm text-gray-600">
                    Para esta gestión, la nota final (100 puntos) se divide en las siguientes categorías:
                </p>
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="w-full md:w-2/5 h-[180px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius="80%"
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="w-full md:w-3/5 space-y-2">
                        {data.map((item, index) => (
                            <div key={index} className="flex justify-between items-center p-2 rounded"
                                 style={{backgroundColor: `${COLORS[index % COLORS.length]}22`}}>
                  <span className="text-sm font-medium" style={{color: COLORS[index % COLORS.length]}}>
                    {item.name}
                  </span>
                                <span className="text-sm font-bold">{item.value} pts</span>
                            </div>))}
                    </div>
                </div>
                <div className="space-y-4">
                    <div>
                        <h5 className="font-semibold text-purple-600 mb-2">1. Sprints
                            ({scoreConfiguration.sprints} pts)</h5>
                        <p className="text-sm text-gray-600 mb-2">
                            Los sprints son evaluaciones continuas del trabajo en equipo. Cada sprint puede tener un
                            valor diferente, y la suma de todos los sprints da el total
                            de {scoreConfiguration.sprints} puntos.
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                            Por ejemplo, un grupo puede tener 3 sprints, cada uno con un valor del 33% del total de
                            puntos de sprints.
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                            Cada sprint se evalúa de la siguiente manera:
                        </p>
                        <div className="space-y-2 ml-4">
                            {sprintData.map((item, index) => (<div key={index} className="flex items-center">
                                <div className="w-24 text-sm">{item.name}</div>
                                <div className="flex-1 h-6 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full"
                                        style={{
                                            width: `${item.value}%`, backgroundColor: COLORS[index % COLORS.length],
                                        }}
                                    />
                                </div>
                                <div className="w-12 text-sm font-bold text-right">{item.value}%</div>
                            </div>))}
                        </div>
                    </div>
                    <div>
                        <h5 className="font-semibold text-purple-600 mb-2">2. Propuesta
                            ({scoreConfiguration.proposal} pts)</h5>
                        <p className="text-sm text-gray-600 mb-2">
                            La evaluación de la propuesta se divide en dos partes:
                        </p>
                        <ul className="list-disc list-inside text-sm text-gray-600 ml-4">
                            <li>Parte A: Especificación de la grupo-empresa constituida.</li>
                            <li>Parte B: Propuesta técnica.</li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-semibold text-purple-600 mb-2">3. Evaluación Cruzada
                            ({scoreConfiguration.cross_evaluation} pts)</h5>
                        <p className="text-sm text-gray-600">
                            Esta es una evaluación entre grupos, donde los estudiantes evalúan el trabajo de sus
                            compañeros.
                        </p>
                    </div>
                </div>
                <p className="text-sm text-gray-600">
                    Nota: Esta distribución de puntos es específica para la gestión actual. La cantidad de sprints,
                    sus valores individuales y otros detalles pueden variar en futuras gestiones o para otros
                    cursos.
                </p>
                <p className="text-sm text-gray-600">
                    Para ver los detalles de calificación de cada estudiante, incluyendo las notas de autoevaluación
                    y evaluación de pares, haga clic en "Ver Detalles" en la tabla de estudiantes.
                </p>
            </div>
        </DialogContent>
    </Dialog>);
};

export default HelpDialog;