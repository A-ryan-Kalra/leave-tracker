import { useEffect, useState } from "react";
import {
  Calendar,
  momentLocalizer,
  type View,
  // type Event,
  Navigate,
} from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import ShowLeaveDialog from "./dashboard-feature/show-leave-dialog";
import type { CalendarEvent, startEndDateType } from "type";
import { toast } from "sonner";
import { api } from "@/utils/api";
import { useUserData } from "@/hooks/user-data";
import { useLeaveRequests } from "@/hooks/useLeaveRequests";

function Calender() {
  const localizer = momentLocalizer(moment);
  const [view, setView] = useState<View>("month");
  const storedData = useUserData();
  const userData = storedData?.data;
  const [date, setDate] = useState(new Date());
  const [startEndDate, setStarEndDate] = useState<startEndDateType>({
    start: new Date(),
    end: new Date(),
  });
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState<boolean>(false);
  // const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
  //   null
  // );

  // const [showEventModal, setShowEventModal] = useState(false);

  // const [events, setEvents] = useState<CalendarEvent[]>([]);
  const {
    data: events = [],
    isLoading,
    isError,
  } = useLeaveRequests(userData?.id);

  // Handle selecting a time slot (creating new event)
  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set the time to midnight

    if (start < today) {
      // alert("You cannot select a date earlier than today.");
      toast("Error", {
        description: "You cannot select a date earlier than today.",
        style: { backgroundColor: "red", color: "white" },
        richColors: true,
      });
      return;
    }

    const inclusiveEnd = new Date(end);
    inclusiveEnd.setDate(end.getDate() - 1);
    setIsLeaveDialogOpen(true);
    const diffTime = inclusiveEnd.getTime() - start.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
    setStarEndDate({ start, end: end, totalDay: diffDays });
  };

  // Handle selecting an existing event
  const handleSelectEvent = (event: CalendarEvent) => {
    event;
    // setSelectedEvent(event);
    // setShowEventModal(true);
  };

  // Handle double-clicking an event
  const handleDoubleClickEvent = () => {
    // console.log("Event double-clicked:", event);
    // const newTitle = window.prompt("Change event title:", event.reason);
    // if (newTitle !== null) {
    //   setEvents((prev) =>
    //     prev.map((e) => (e.id === event.id ? { ...e, title: newTitle } : e))
    //   );
    // }
  };

  // Delete selected event
  // const deleteEvent = () => {
  //   if (selectedEvent) {
  //     setEvents((prev) => prev.filter((e) => e.id !== selectedEvent.id));
  //     setShowEventModal(false);
  //     setSelectedEvent(null);
  //   }
  // };

  // // Update selected event
  // const updateEvent = () => {
  //   alert("wow1");
  //   if (selectedEvent) {
  //     const newTitle = window.prompt(
  //       "Update event title:",
  //       selectedEvent.reason
  //     );
  //     const newDescription = window.prompt(
  //       "Update event description:",
  //       selectedEvent.reason || ""
  //     );

  //     if (newTitle !== null) {
  //       setEvents((prev) =>
  //         prev.map((e) =>
  //           e.id === selectedEvent.id
  //             ? {
  //                 ...e,
  //                 reason: newTitle,
  //                 description: newDescription || "",
  //               }
  //             : e
  //         )
  //       );
  //       setShowEventModal(false);
  //       setSelectedEvent(null);
  //     }
  //   }
  // };

  // Navigation handlers
  const handleNavigate = (newDate: Date) => {
    setDate(newDate);
  };
  async function addEvents(newEvent: CalendarEvent) {
    try {
      toast("Processing...", {
        description: <div>Hold on!</div>,
        style: { backgroundColor: "white", color: "black" },
        richColors: true,
        duration: 5000,
      });

      await api.post(`/dashboard/add-leave-request/${userData?.id}`, {
        leaveTypeId: newEvent.leaveType,
        startDate: newEvent.start.toISOString(),
        endDate: newEvent.end.toISOString(),
        reason: newEvent.reason,
      });
      toast("Success", {
        description: `Applied for leave request.`,
        style: { backgroundColor: "white", color: "black" },
        richColors: true,
      });

      // setEvents((prev) => {
      //   const updatedEvents = [...prev, newEvent];

      //   return updatedEvents;
      // });
    } catch (error) {
      console.error(error);
      toast("Error", {
        description: `Something went wrong`,
        style: { backgroundColor: "white", color: "black" },
        richColors: true,
      });
    }
  }

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

    useEffect(() => {
      if (events.length) {
        // setEvents(events);
      }
    }, [events]);
    console.log(userData);
    if (isLoading) return <p>Loading...</p>;
    if (isError) return <p>Failed to load leave requests.</p>;
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

  return (
    <div className="h-screen w-full p-2">
      <div className="mb-4">
        <h1 className="text-xl font-semibold mb-2">Calendar</h1>
        <p className="text-gray-600">
          Click on a time slot to create an event. Once approved, the event will
          be displayed on the calendar.
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
            event: (props) => {
              return (
                <div
                  style={{
                    padding: "2px 4px",
                    fontSize: "12px",
                  }}
                >
                  {`${props.event?.fullName} | ${
                    props.event.leaveType
                  } | ${moment(props.event.start).format("MM/DD")} - ${moment(
                    props.event.end
                  ).format("MM/DD")}` || "No Reason"}
                </div>
              );
            },
          }}
          // Mobile-specific configurations
          longPressThreshold={10}
        />
      </div>
    </div>
  );
}

export default Calender;
