import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AnnouncementForm = ({ announcements, setAnnouncements }) => {
    const [formData, setFormData] = useState({
        title: "",
        date: "",
        description: "",
    });
    const [isFormOpen, setIsFormOpen] = useState(false);
    const formRef = useRef(null);

    const toggleForm = () => {
        setIsFormOpen(!isFormOpen);
        if (!isFormOpen) {
            setTimeout(() => {
                formRef.current.scrollIntoView({ behavior: "smooth" });
            }, 100);
        }
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setAnnouncements((prev) => [
            ...prev,
            { title: formData.title, date: formData.date, description: formData.description },
        ]);
        setFormData({
            title: "",
            date: "",
            description: "",
        });
        setIsFormOpen(false);
    };

    return (
        <div className="mt-4">
            <Button onClick={toggleForm} className="bg-purple-600 hover:bg-purple-700 text-white rounded-md py-2 px-4">
                {isFormOpen ? "Cancelar" : "Añadir Recurso"}
            </Button>

            {isFormOpen && (
                <div className="mt-6 bg-gray-100 p-4 rounded-md shadow-md" ref={formRef}>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Título</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleFormChange}
                                className="mt-1 block w-full p-3 border border-gray-300 rounded-lg"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Fecha</label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleFormChange}
                                className="mt-1 block w-full p-3 border border-gray-300 rounded-lg"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Descripción</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleFormChange}
                                className="mt-1 block w-full p-3 border border-gray-300 rounded-lg"
                                rows="3"
                                required
                            ></textarea>
                        </div>

                        <Button
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg"
                            type="submit"
                        >
                            Enviar
                        </Button>
                    </form>
                </div>
            )}


            <div className="mt-8">
                <h2 className="text-2xl font-bold text-purple-700">Anuncios Publicados</h2>
                {announcements.length > 0 ? (
                    <div className="mt-4 space-y-4">
                        {announcements.map((announcement, index) => (
                            <Card key={index} className="bg-white shadow-md p-4 rounded-lg">
                                <CardHeader>
                                    <CardTitle className="text-xl font-semibold text-purple-700">{announcement.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-600">Fecha: {announcement.date}</p>
                                    <p className="mt-2 text-gray-700">{announcement.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-600 mt-4">No hay anuncios publicados todavía.</p>
                )}
            </div>
        </div>
    );
};

export default AnnouncementForm;
