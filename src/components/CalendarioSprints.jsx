import React, { useCallback, useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { getData, postData, putData, deleteData} from "../api/apiService";
import {
  AlertCircle,
  Calendar as CalendarIcon,
  Edit2,
  Loader2,
  Plus,
} from "lucide-react";

moment.locale("es");
const localizer = momentLocalizer(moment);

const messages = {
  allDay: "Todo el día",
  previous: "Anterior",
  next: "Siguiente",
  today: "Hoy",
  month: "Mes",
  week: "Semana",
  day: "Día",
  agenda: "Agenda",
  date: "Fecha",
  time: "Hora",
  event: "Sprint",
  noEventsInRange: "No hay sprints en este rango",
  showMore: (total) => `+ Ver más (${total})`,
};

const formats = {
  monthHeaderFormat: "MMMM YYYY",
  weekdayFormat: "dd",
  dayFormat: "D",
  dayRangeHeaderFormat: ({ start, end }) =>
      `${moment(start).format("D MMM")} - ${moment(end).format("D MMM YYYY")}`,
  dayHeaderFormat: "dddd D",
  eventTimeRangeFormat: ({ start, end }) =>
      `${moment(start).format("D MMM")} - ${moment(end).format("D MMM")}`,
  timeGutterFormat: "D",
  agendaDateFormat: "D MMM",
  agendaTimeFormat: "HH:mm",
  agendaTimeRangeFormat: ({ start, end }) =>
      `${moment(start).format("HH:mm")} - ${moment(end).format("HH:mm")}`,
};

export default function CalendarioSprints({ groupId }) {
  const [events, setEvents] = useState([]);
  const [currentEvent, setCurrentEvent] = useState({
    title: "",
    start: "",
    end: "",
    features: "",
    percentage: "",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [featureCount, setFeatureCount] = useState(0);
  const { toast } = useToast();

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);


  const openConfirmDialog = () => {
    setIsConfirmDialogOpen(true);
  };


  const fetchSprints = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getData(`/sprints?group_id=${groupId}`);
      setEvents(
          response.map((sprint) => ({
            ...sprint,
            start: moment(sprint.start_date).startOf('day').toDate(),
            end: moment(sprint.end_date).endOf('day').toDate(),
            featureCount: sprint.features.split("\n").filter(Boolean).length,
          }))
      );
    } catch (error) {
      console.error("Error fetching sprints:", error);
      showToast("Error al cargar los sprints", true);
    } finally {
      setIsLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchSprints();
  }, [fetchSprints]);

  const validateSprintForm = useCallback(
      (sprint) => {
        const errors = {};
        if (!sprint.title.trim())
          errors.title = "El título del sprint es requerido";
        if (!sprint.start) errors.start = "La fecha de inicio es requerida";
        if (!sprint.end) errors.end = "La fecha de fin es requerida";
        if (!sprint.features.trim())
          errors.features = "Debe agregar al menos una característica";
        if (sprint.start && sprint.end && moment(sprint.start).isAfter(moment(sprint.end))) {
          errors.end = "La fecha de fin debe ser posterior o igual a la fecha de inicio";
        } else {
          const hasOverlap = events.some((event) =>
              moment(sprint.start).isBefore(moment(event.end)) &&
              moment(sprint.end).isAfter(moment(event.start)) &&
              event.id !== sprint.id
          );

          if (hasOverlap) {
            errors.dateOverlap = "Las fechas del sprint se solapan con otro sprint existente.";
          }
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
      },
      [events]
  );

  const handleAddEvent = async () => {
    if (validateSprintForm(currentEvent)) {
      try {
        const response = await postData("/sprints", {
          title: currentEvent.title,
          features: currentEvent.features,
          start_date: currentEvent.start,
          end_date: currentEvent.end,
          group_id: groupId,
          percentage: currentEvent.percentage,
        });
        const newEvent = {
          ...response,
          start: moment(response.start_date).startOf('day').toDate(),
          end: moment(response.end_date).endOf('day').toDate(),
          featureCount: response.features.split("\n").filter(Boolean).length,
        };

        setEvents((prevEvents) => [...prevEvents, newEvent]);
        await fetchSprints();
        resetForm();
        showToast("Sprint creado exitosamente", false);
      } catch (error) {
        console.error("Error adding sprint:", error);

        // Traducción de mensajes del backend
        const translateMessage = (message) => {
          const translations = {
            "The sum of the percentages of the tasks exceeds 100%.":
                "La suma de los porcentajes de las tareas supera el 100%.",
            "The start date must be before the end date.":
                "La fecha de inicio debe ser anterior a la fecha de finalización.",
            "The title field is required.":
                "El campo del título es obligatorio.",
          };
          return translations[message] || message;
        };

        // Manejo específico del error
        if (error.response && error.response.status === 400 && error.response.data) {
          const serverMessage = error.response.data.message || "Error desconocido.";
          const translatedMessage = translateMessage(serverMessage);
          showToast(translatedMessage, true);
        } else {
          showToast("Error al crear el sprint. Por favor, inténtalo de nuevo.", true);
        }
      }
    }
  };

  const handleUpdateEvent = async () => {
    if (validateSprintForm(currentEvent)) {
      try {
        const response = await putData(`/sprints/${currentEvent.id}`, {
          title: currentEvent.title,
          features: currentEvent.features,
          start_date: currentEvent.start,
          end_date: currentEvent.end,
          percentage: currentEvent.percentage,
        });
        const updatedEvent = {
          ...response,
          start: moment(response.start_date).startOf('day').toDate(),
          end: moment(response.end_date).endOf('day').toDate(),
          featureCount: response.features.split("\n").filter(Boolean).length,
        };
        setEvents((prevEvents) =>
            prevEvents.map((event) =>
                event.id === currentEvent.id ? updatedEvent : event
            )
        );

        resetForm();
        showToast("Sprint actualizado exitosamente", false);
      } catch (error) {
        console.error("Error updating sprint:", error);
        showToast("Error al actualizar el sprint", true);
      }
    }
  };

  const resetForm = () => {
    setCurrentEvent({ title: "", start: "", end: "", features: "", percentage: "" });
    setIsDialogOpen(false);
    setIsEditing(false);
    setFormErrors({});
    setFeatureCount(0);
  };

  const showToast = (message, isError) => {
    toast({
      title: isError ? "Error" : "Éxito",
      description: message,
      variant: isError ? "destructive" : "success",
      className: isError ? "bg-red-500 text-white" : "bg-green-500 text-white",
    });
  };

  const handleSelectSlot = ({ start, end }) => {
    setCurrentEvent({
      title: "",
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
      features: "",
      percentage: "",
    });
    setIsEditing(false);
    setIsDialogOpen(true);
    setFeatureCount(0);
  };

  const handleSelectEvent = (event) => {
    setCurrentEvent({
      ...event,
      start: moment(event.start).format("YYYY-MM-DD"), // Convertir la fecha de inicio correctamente
      end: moment(event.end).format("YYYY-MM-DD"), // Convertir la fecha de fin correctamente
      percentage: event.percentage || "",
    });
    setIsEditing(true);
    setIsDialogOpen(true);
    setFeatureCount(event.features.split("\n").filter(Boolean).length);
  };

  const eventStyleGetter = (event, start, end, isSelected) => ({
    style: {
      backgroundColor: "#8B5CF6",
      borderRadius: "4px",
      opacity: 0.8,
      color: "white",
      border: "0px",
      display: "block",
      overflow: "hidden",
      fontSize: "0.8rem",
      padding: "2px 4px",
    },
  });

  const CustomEvent = ({ event }) => (
      <div className="text-xs sm:text-sm">
        <strong>{event.title}</strong>
        <br />
        <span>{event.featureCount} caract.</span>
      </div>
  );

  const CustomToolbar = ({ label, onNavigate, onView }) => (
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 p-2 bg-purple-100 rounded-lg space-y-2 sm:space-y-0">
        <div className="flex space-x-2">
          <Button
              onClick={() => onNavigate("PREV")}
              variant="outline"
              size="sm"
              className="text-purple-600 border-purple-600 text-xs sm:text-sm"
          >
            {"<"}
          </Button>
          <Button
              onClick={() => onNavigate("NEXT")}
              variant="outline"
              size="sm"
              className="text-purple-600 border-purple-600 text-xs sm:text-sm"
          >
            {">"}
          </Button>
          <Button
              onClick={() => onNavigate("TODAY")}
              variant="outline"
              size="sm"
              className="text-purple-600 border-purple-600 text-xs sm:text-sm"
          >
            Hoy
          </Button>
        </div>
        <h2 className="text-lg sm:text-xl font-semibold text-purple-800">
          {label}
        </h2>
        <div className="flex space-x-2">
          <Button
              onClick={() => onView("month")}
              variant="outline"
              size="sm"
              className="text-purple-600 border-purple-600 text-xs sm:text-sm"
          >
            Mes
          </Button>
          <Button
              onClick={() => onView("agenda")}
              variant="outline"
              size="sm"
              className="text-purple-600 border-purple-600 text-xs sm:text-sm"
          >
            Agenda
          </Button>
        </div>
      </div>
  );

  return (
      <div className="space-y-6">
        <Card className="bg-white shadow-lg">
          <CardHeader className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <CardTitle className="text-xl sm:text-2xl font-bold text-purple-800">
              Calendario de Sprints
            </CardTitle>
            <Button
                onClick={() => {
                  setCurrentEvent({ title: "", start: "", end: "", features: "", percentage: "" });
                  setIsEditing(false);
                  setIsDialogOpen(true);
                  setFeatureCount(0);
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto text-sm sm:text-base"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Sprint
            </Button>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            {isLoading ? (
                <div className="flex items-center justify-center h-[500px]">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                  <span className="ml-2 text-lg font-medium text-purple-600">
                Cargando sprints...
              </span>
                </div>
            ) : (
                <div className="min-w-full" style={{ overflowX: "auto" }}>
                  <Calendar
                      localizer={localizer}
                      events={events}
                      startAccessor="start"
                      endAccessor="end"
                      messages={messages}
                      formats={formats}
                      culture="es"
                      style={{ height: 500, minWidth: "100%" }}
                      onSelectEvent={handleSelectEvent}
                      onSelectSlot={handleSelectSlot}
                      selectable
                      views={["month", "agenda"]}
                      defaultView="month"
                      eventPropGetter={eventStyleGetter}
                      components={{
                        toolbar: CustomToolbar,
                        event: CustomEvent,
                      }}
                      className="text-xs sm:text-sm"
                  />
                </div>
            )}
          </CardContent>
        </Card>
        <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              if (!open) {
                resetForm();
              }
              setIsDialogOpen(open);
            }}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Editar Sprint" : "Agregar Nuevo Sprint"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Título
                </label>
                <Input
                    id="title"
                    placeholder="Título del sprint"
                    value={currentEvent.title}
                    onChange={(e) =>
                        setCurrentEvent({ ...currentEvent, title: e.target.value })
                    }
                    className={formErrors.title ? "border-red-500" : ""}
                />
                {formErrors.title && (
                    <p className="text-red-500 text-sm">{formErrors.title}</p>
                )}
              </div>
              <div className="grid gap-2">
                <label htmlFor="start" className="text-sm font-medium">
                  Inicio
                </label>
                <div className="relative">
                  <Input
                      id="start"
                      type="date"
                      value={currentEvent.start}
                      onChange={(e) =>
                          setCurrentEvent({ ...currentEvent, start: e.target.value })
                      }
                      className={`pl-10  ${formErrors.start ? "border-red-500" : ""}`}
                  />
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                {formErrors.start && (
                    <p className="text-red-500 text-sm">{formErrors.start}</p>
                )}
              </div>
              <div className="grid gap-2">
                <label htmlFor="end" className="text-sm font-medium">
                  Fin
                </label>
                <div className="relative">
                  <Input
                      id="end"
                      type="date"
                      value={currentEvent.end}
                      onChange={(e) =>
                          setCurrentEvent({ ...currentEvent, end: e.target.value })
                      }
                      className={`pl-10 ${formErrors.end ? "border-red-500" : ""}`}
                  />
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                {formErrors.end && (
                    <p className="text-red-500 text-sm">{formErrors.end}</p>
                )}
              </div>
              {formErrors.dateOverlap && (
                  <div className="flex items-center gap-2 text-red-500">
                    <AlertCircle className="h-5 w-5" />
                    <p className="text-sm">{formErrors.dateOverlap}</p>
                  </div>
              )}
              <div className="grid gap-2">
                <label htmlFor="features" className="text-sm font-medium">
                  Características ({featureCount})
                </label>
                <Textarea
                    id="features"
                    placeholder="Características a trabajar (una por línea)"
                    value={currentEvent.features}
                    onChange={(e) => {
                      setCurrentEvent({
                        ...currentEvent,
                        features: e.target.value,
                      });
                      setFeatureCount(
                          e.target.value.split("\n").filter(Boolean).length,
                      );
                    }}
                    className={formErrors.features ? "border-red-500" : ""}
                    rows={5}
                />
                {formErrors.features && (
                    <p className="text-red-500 text-sm">{formErrors.features}</p>
                )}
              </div>
              <div className="grid gap-2">
                <label htmlFor="percentage" className="text-sm font-medium">
                  Porcentaje
                </label>
                <div className="relative group">
                  <Input
                      id="percentage"
                      type="number"
                      placeholder="Porcentaje de avance"
                      min="0"
                      max="100"
                      value={currentEvent.percentage}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (!isEditing && (value === "" || (value >= 0 && value <= 100))) {
                          setCurrentEvent({
                            ...currentEvent,
                            percentage: value,
                          });
                        }
                      }}
                      className={`${formErrors.percentage ? "border-red-500" : ""} ${
                          isEditing ? "cursor-not-allowed bg-gray-200" : ""
                      }`}
                      disabled={isEditing} // Bloquear si está en modo de edición
                  />
                  {isEditing && (
                      <div className="absolute left-0 top-full mt-1 w-full p-2 bg-white text-purple text-xs rounded shadow-lg opacity-0 group-hover:opacity-100">
                        No puedes editar el porcentaje en el modo de edición.
                      </div>
                  )}
                </div>
                {formErrors.percentage && (
                    <p className="text-red-500 text-sm">{formErrors.percentage}</p>
                )}
                </div>
              </div>
              <DialogFooter>
              <Button
                  onClick={isEditing ? handleUpdateEvent : handleAddEvent}
                  className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto"
              >
                {isEditing ? <Edit2 className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                {isEditing ? "Actualizar Sprint" : "Agregar Sprint"}
              </Button>
            </DialogFooter>

          </DialogContent>
        </Dialog>
      </div>
  );
}
