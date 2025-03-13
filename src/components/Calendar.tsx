import { Calendar, dayjsLocalizer, Views } from 'react-big-calendar'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import dayjs from 'dayjs'
import './Calendar.css'
import { CalendarEvent } from '../types/CalendarEvent';

const localizer = dayjsLocalizer(dayjs);

interface CustomCalendarProps {
    events: CalendarEvent[];
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({ events }) => {
    const eventColors: Record<string, string> = {
        "Entrada": "green",
        "Salida": "red",
        "Horas extra": "blue",
        "Terminadas horas extra": "darkblue",
        "Descanso": "orange",
        "Terminado el descanso": "darkorange",
    };

    const getEventStyle = (event: CalendarEvent) => {
        const backgroundColor = eventColors[event.type] || "gray";
        return { style: { 
            backgroundColor, 
            color: "white",
            borderRadius: "5px", 
            padding: "5px", 
            height: "auto",
            minHeight: "40px",
            whiteSpace: "normal", 
        } };
    };

    return (
        <div className="calendar-section">
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: "90vh", width: "90vw" }}
                eventPropGetter={getEventStyle}
                views={{ month: true, week: true, work_week: true, day: true }}
                defaultView="month"
                dayLayoutAlgorithm="no-overlap"
                popup={true}
            />
        </div>
    );
};

export default CustomCalendar;
