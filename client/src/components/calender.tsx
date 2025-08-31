import { useState } from "react";
import {
  Calendar,
  momentLocalizer,
  type View,
  type Event,
  Navigate,
} from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import ShowLeaveDialog from "./dashboard-feature/alert_dialog/show-leave-dialog";
import type { CalendarEvent, startEndDateType } from "type";

function Calender() {
  const localizer = momentLocalizer(moment);
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState(new Date());
  const [startEndDate, setStarEndDate] = useState<startEndDateType>({
    start: new Date(),
    end: new Date(),
  });
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );

  const [showEventModal, setShowEventModal] = useState(false);

  const [events, setEvents] = useState<CalendarEvent[]>([]);

  // Handle selecting a time slot (creating new event)
  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setStarEndDate({ end, start });
    setIsLeaveDialogOpen(true);
  };
  console.log(events);
  // Handle selecting an existing event
  const handleSelectEvent = (event: CalendarEvent) => {
    console.log("Event selected:", event);
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  // Handle double-clicking an event
  const handleDoubleClickEvent = (event: CalendarEvent) => {
    console.log("Event double-clicked:", event);
    const newTitle = window.prompt("Change event title:", event.reason);
    if (newTitle !== null) {
      setEvents((prev) =>
        prev.map((e) => (e.id === event.id ? { ...e, title: newTitle } : e))
      );
    }
  };

  // Delete selected event
  const deleteEvent = () => {
    if (selectedEvent) {
      setEvents((prev) => prev.filter((e) => e.id !== selectedEvent.id));
      setShowEventModal(false);
      setSelectedEvent(null);
    }
  };

  // Update selected event
  const updateEvent = () => {
    if (selectedEvent) {
      const newTitle = window.prompt(
        "Update event title:",
        selectedEvent.reason
      );
      const newDescription = window.prompt(
        "Update event description:",
        selectedEvent.reason || ""
      );

      if (newTitle !== null) {
        setEvents((prev) =>
          prev.map((e) =>
            e.id === selectedEvent.id
              ? {
                  ...e,
                  title: newTitle,
                  description: newDescription || undefined,
                }
              : e
          )
        );
        setShowEventModal(false);
        setSelectedEvent(null);
      }
    }
  };

  // Navigation handlers
  const handleNavigate = (newDate: Date, view: View, action: string) => {
    setDate(newDate);
  };

  // Custom toolbar component
  const CustomToolbar = (toolbar: any) => {
    const goToToday = () => {
      toolbar.onNavigate(Navigate.TODAY);
    };

    const goToPrevious = () => {
      toolbar.onNavigate(Navigate.PREVIOUS);
    };

    const goToNext = () => {
      toolbar.onNavigate(Navigate.NEXT);
    };

    const viewNames = {
      month: "Month",
      week: "Week",
      day: "Day",
      agenda: "Agenda",
    };

    return (
      <div className="rbc-toolbar mb-4">
        <div className="rbc-btn-group">
          <button type="button" onClick={goToPrevious}>
            Back
          </button>
          <button type="button" onClick={goToNext}>
            Next
          </button>
          <button type="button" onClick={goToToday}>
            Today
          </button>
        </div>
        <span className="rbc-toolbar-label">{toolbar.label}</span>
        <div className="rbc-btn-group">
          {toolbar.views.map((view: View) => (
            <button
              key={view}
              type="button"
              className={toolbar.view === view ? "rbc-active" : ""}
              onClick={() => toolbar.onView(view)}
            >
              {viewNames[view as keyof typeof viewNames]}
            </button>
          ))}
        </div>
      </div>
    );
  };

  function addEvents(newEvent: CalendarEvent) {
    setEvents((prev) => [...prev, newEvent]);
  }
  return (
    <div className="h-screen w-full bg-black/10 p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-2">Calendar</h1>
        <p className="text-gray-600">
          Click on a time slot to create an event, or click on an existing event
          to edit it.
        </p>
      </div>
      <ShowLeaveDialog
        events={addEvents}
        open={isLeaveDialogOpen}
        startEndDate={startEndDate}
        setOpen={() => setIsLeaveDialogOpen(false)}
      />
      <div className="bg-white rounded-lg shadow-lg p-4">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          view={view}
          date={date}
          onView={setView}
          onNavigate={handleNavigate}
          views={["month", "week", "day", "agenda"]}
          selectable="ignoreEvents"
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          onDoubleClickEvent={handleDoubleClickEvent}
          min={new Date(0, 0, 0, 8, 0, 0)} // 8:00 AM
          max={new Date(0, 0, 0, 20, 0, 0)} // 8:00 PM
          step={60} // 60-minute intervals for better mobile experience
          timeslots={1} // 1 slot per step for mobile
          defaultView="month"
          popup
          tooltipAccessor={(event) => event.reason}
          components={{
            toolbar: CustomToolbar,
          }}
          // Mobile-specific configurations
          longPressThreshold={10}
        />
      </div>

      {/* Event Modal */}
      {/* {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Event Details</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <p className="text-gray-900">{selectedEvent.title}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Start
                </label>
                <p className="text-gray-900">
                  {moment(selectedEvent.start).format("MMMM Do YYYY, h:mm a")}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  End
                </label>
                <p className="text-gray-900">
                  {moment(selectedEvent.end).format("MMMM Do YYYY, h:mm a")}
                </p>
              </div>
              {selectedEvent.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <p className="text-gray-900">{selectedEvent.description}</p>
                </div>
              )}
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={updateEvent}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
              >
                Edit
              </button>
              <button
                onClick={deleteEvent}
                className="flex-1 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
              >
                Delete
              </button>
              <button
                onClick={() => setShowEventModal(false)}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
}

export default Calender;
