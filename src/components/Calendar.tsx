import React, { useState } from "react";
import { Calendar, dayjsLocalizer, View, NavigateAction } from "react-big-calendar";
import dayjs from "dayjs";
import 'dayjs/locale/es';
import "react-big-calendar/lib/css/react-big-calendar.css";
import './Calendar.css'

import { CalendarEvent } from "../types/CalendarEvent";
import { useNavigation } from "../hooks/useNavigation";

const localizer = dayjsLocalizer(dayjs);
dayjs.locale('es');

interface CustomCalendarProps {
    events: CalendarEvent[];
    onSelectEvent?: (event: CalendarEvent) => void;
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({ events, onSelectEvent }) => {
    const navigation = useNavigation();
    const isMobile = window.innerWidth < 768;

    const [currentView, setCurrentView] = useState<View>(isMobile ? "day" : "month");
    const [currentDate, setCurrentDate] = useState<Date>(new Date());

    const handleViewChange = (view: View) => {
        setCurrentView(view);
    };

    const handleNavigate = (newDate: Date, newView: View) => {
        setCurrentDate(newDate);
        setCurrentView(newView);
    };

    const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
        setCurrentDate(slotInfo.start);
        setCurrentView("day");
    };

    const eventColors: Record<string, string> = {
        Entrada: "#6eff6c",
        Salida: "#ff2b2b",
        "Horas extra": "#9575CD",
        "Terminadas horas extra": "#BA68C8",
        Descanso: "#85eeff",
        "Terminado el descanso": "#00ACC1",
    };

    const getEventStyle = (event: CalendarEvent) => {
        const backgroundColor = eventColors[event.type] || "gray";
        return {
            style: {
                backgroundColor,
                color: "white",
                borderRadius: "5px",
                padding: "5px",
                height: "auto",
                minHeight: "40px",
                whiteSpace: "normal",
            },
        };
    };

    return (
        <div style={{ height: "90vh", width: "90vw" }}>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"

                view={currentView}
                views={isMobile ? { day: true } : { month: true, week: true, day: true, work_week: true }} onView={handleViewChange}
                date={currentDate}
                onNavigate={handleNavigate}

                selectable
                onSelectSlot={handleSelectSlot}
                onSelectEvent={onSelectEvent}
                drilldownView="day"

                eventPropGetter={getEventStyle}
                style={{ height: "100%" }}
                popup

                messages={{
                    next: "Siguiente",
                    previous: "Anterior",
                    today: "Hoy",
                    month: "Mes",
                    week: "Semana",
                    day: "Día"
                }}
            />
        </div>
    );
};

export default CustomCalendar;
