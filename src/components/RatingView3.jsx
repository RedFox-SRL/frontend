import React, {useEffect, useState} from "react";
import {Dialog, DialogContent} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Card, CardContent} from "@/components/ui/card";
import {getData} from "../api/apiService";
import {ChevronDown, ChevronUp, Users, HelpCircle, Loader2, ArrowLeft} from 'lucide-react';
import HelpDialog from './HelpDialog';

const RatingView3 = ({onBack, managementId}) => {
    const [expandedGroups, setExpandedGroups] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedGroup, setSelectedGroup] = useState("all");
    const [managementInfo, setManagementInfo] = useState(null);
    const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);
    const [scoreConfiguration, setScoreConfiguration] = useState({});
    const [sprintComposition, setSprintComposition] = useState({});

    const toggleGroup = (groupId) => {
        setExpandedGroups(prev => prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]);
    };

    const openModal = (student) => {
        setSelectedStudent(student);
    };

    const closeModal = () => {
        setSelectedStudent(null);
    };

    useEffect(() => {
        const fetchGradeSummary = async () => {
            try {
                const response = await getData(`/grade-summary/${managementId}`);
                if (response.success && response.data.groups.length > 0) {
                    setGroups(response.data.groups);
                    setManagementInfo(response.data.management_info);
                    const firstGroup = response.data.groups[0];
                    setScoreConfiguration(firstGroup.score_configuration);
                    if (firstGroup.students.length > 0 && firstGroup.students[0].sprints_detail.length > 0) {
                        const firstSprint = firstGroup.students[0].sprints_detail[0];
                        setSprintComposition({
                            teacher: firstSprint.teacher_percentage,
                            self: firstSprint.self_evaluation_percentage,
                            peer: firstSprint.peer_evaluation_percentage,
                        });
                    }
                }
            } catch (error) {
                console.error("Error fetching grade summary:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchGradeSummary();
    }, [managementId]);

    if (loading) {
        return (<div className="flex justify-center items-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600"/>
            <span className="ml-2 text-lg font-medium text-purple-600">Cargando...</span>
        </div>);
    }

    if (groups.length === 0) {
        return (<div className="flex flex-col items-center justify-center h-screen space-y-4">
            <h3 className="text-purple-700 font-bold text-xl">No hay grupos registrados</h3>
            <p className="text-gray-600">No se han encontrado grupos para mostrar calificaciones.</p>
        </div>);
    }

    const filteredGroups = selectedGroup === "all" ? groups : groups.filter(g => g.group_id.toString() === selectedGroup);

    return (<div className="min-h-screen p-4 sm:p-6">
        <div
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
            <div className="w-full sm:w-auto flex items-center">
                <h3 className="text-purple-700 font-bold text-xl sm:text-2xl mb-2">Resumen de Calificaciones</h3>
                <Button
                    variant="ghost"
                    className="text-purple-600 hover:text-purple-800 flex items-center ml-2"
                    onClick={() => setIsHelpDialogOpen(true)}
                >
                    <HelpCircle className="w-5 h-5"/>
                </Button>
            </div>
            {managementInfo && (<p className="text-purple-600 text-sm sm:text-base">
                {managementInfo.semester} semestre, {managementInfo.year}
            </p>)}
            <Select
                value={selectedGroup}
                onValueChange={setSelectedGroup}
            >
                <SelectTrigger className="w-full sm:w-[200px] bg-white">
                    <SelectValue placeholder="Todos los Grupos"/>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos los Grupos</SelectItem>
                    {groups.map(group => (<SelectItem key={group.group_id} value={group.group_id.toString()}>
                        {group.group_name}
                    </SelectItem>))}
                </SelectContent>
            </Select>
        </div>

        {filteredGroups.map((group) => (<Card key={group.group_id} className="mb-6">
            <div
                className="flex justify-between items-center p-4 cursor-pointer bg-purple-100 hover:bg-purple-200 transition-colors rounded-t-lg"
                onClick={() => toggleGroup(group.group_id)}
            >
                <div className="flex items-center gap-2 text-purple-700 font-bold">
                    <Users className="w-5 h-5"/>
                    <h4 className="text-sm sm:text-base">{group.group_name}</h4>
                </div>
                <div className="flex items-center gap-2">
                            <span
                                className="text-purple-500 text-xs sm:text-sm">{group.students.length} estudiantes</span>
                    {expandedGroups.includes(group.group_id) ? (<ChevronUp className="w-5 h-5 text-purple-500"/>) : (
                        <ChevronDown className="w-5 h-5 text-purple-500"/>)}
                </div>
            </div>
            {expandedGroups.includes(group.group_id) && (<CardContent className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    {Object.entries(group.group_scores).map(([key, value]) => (<Card key={key}>
                        <CardContent className="p-4">
                            <h4 className="text-purple-600 font-semibold mb-2 capitalize text-sm sm:text-base">
                                {key === 'sprints' ? 'Sprints' : key === 'proposal' ? 'Propuesta' : key === 'cross_evaluation' ? 'Evaluación Cruzada' : key}
                            </h4>
                            <p className="text-xl sm:text-2xl font-bold text-purple-800">
                                {value.toFixed(2)}
                                <span className="text-xs sm:text-sm text-purple-600 ml-1">
                                                    /{group.score_configuration[key]} pts
                                                </span>
                            </p>
                        </CardContent>
                    </Card>))}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                        <tr className="border-b">
                            <th className="py-2 text-purple-700">Estudiante</th>
                            <th className="py-2 text-purple-700">Sprints
                                ({group.score_configuration.sprints} pts)
                            </th>
                            <th className="py-2 text-purple-700">Propuesta
                                ({group.score_configuration.proposal} pts)
                            </th>
                            <th className="py-2 text-purple-700">Eval. Cruzada
                                ({group.score_configuration.cross_evaluation} pts)
                            </th>
                            <th className="py-2 text-purple-700">Nota Final</th>
                            <th className="py-2 text-purple-700">Detalles</th>
                        </tr>
                        </thead>
                        <tbody>
                        {group.students.map((student) => (<tr key={student.student_id} className="border-b">
                            <td className="py-2">{student.name} {student.last_name}</td>
                            <td className="py-2">{student.sprint_final_score.toFixed(2)}</td>
                            <td className="py-2">{student.proposal_score.toFixed(2)}</td>
                            <td className="py-2">{student.cross_evaluation_score.toFixed(2)}</td>
                            <td className="py-2 font-bold">{student.final_score.toFixed(2)}/100</td>
                            <td className="py-2">
                                <Button
                                    variant="ghost"
                                    onClick={() => openModal(student)}
                                    className="text-purple-600 hover:text-purple-800 text-xs sm:text-sm p-1 sm:p-2"
                                >
                                    Ver Detalles
                                </Button>
                            </td>
                        </tr>))}
                        </tbody>
                    </table>
                </div>
            </CardContent>)}
        </Card>))}

        <Dialog open={!!selectedStudent} onOpenChange={closeModal}>
            <DialogContent className="bg-white p-4 sm:p-6 rounded-lg w-[95vw] sm:w-[90vw] max-w-2xl mx-auto">
                <h4 className="text-purple-700 font-bold text-lg sm:text-xl mb-4">
                    Detalles de {selectedStudent?.name} {selectedStudent?.last_name}
                </h4>

                <div className="bg-purple-50 p-4 rounded-lg space-y-2 mb-6">
                    <div className="flex justify-between">
                        <span>Sprints:</span>
                        <span className="font-bold">{selectedStudent?.sprint_final_score.toFixed(2)} pts</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Propuestas:</span>
                        <span className="font-bold">{selectedStudent?.proposal_score.toFixed(2)} pts</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Evaluación Cruzada:</span>
                        <span className="font-bold">{selectedStudent?.cross_evaluation_score.toFixed(2)} pts</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                        <span className="font-bold">Nota Final:</span>
                        <span className="font-bold text-lg">{selectedStudent?.final_score.toFixed(2)}/100 pts</span>
                    </div>
                </div>

                <div>
                    <h4 className="text-purple-600 font-semibold mb-2">Detalle de Sprints</h4>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                            <tr className="border-b">
                                <th className="py-2">Sprint</th>
                                <th className="py-2">Docente
                                    ({selectedStudent?.sprints_detail[0]?.teacher_percentage}%)
                                </th>
                                <th className="py-2">Auto
                                    ({selectedStudent?.sprints_detail[0]?.self_evaluation_percentage}%)
                                </th>
                                <th className="py-2">Pares
                                    ({selectedStudent?.sprints_detail[0]?.peer_evaluation_percentage}%)
                                </th>
                                <th className="py-2">Total</th>
                            </tr>
                            </thead>
                            <tbody>
                            {selectedStudent?.sprints_detail.map((detail, index) => (
                                <tr key={index} className="border-b">
                                    <td className="py-2">{detail.title}</td>
                                    <td className="py-2">{detail.teacher_grade}</td>
                                    <td className="py-2">{detail.self_evaluation_grade}</td>
                                    <td className="py-2">{detail.peer_evaluation_grade}</td>
                                    <td className="py-2 font-bold">{detail.weighted_score.toFixed(2)}/100</td>
                                </tr>))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </DialogContent>
        </Dialog>

        <HelpDialog
            isOpen={isHelpDialogOpen}
            onClose={() => setIsHelpDialogOpen(false)}
            scoreConfiguration={scoreConfiguration}
            sprintComposition={sprintComposition}
        />
    </div>);
};

export default RatingView3;

