import { tool } from "@langchain/core/tools";
import z from "zod";
import { calendar } from "../app.js";

export const findAndDeleteEventTool = tool(
  async (params) => {
    try {
      console.log("findAndDeleteEventTool: ", params);

      const { q, timeMin, timeMax } = params;
      const findEvents = await calendar.events.list({
        calendarId: "primary",
        q,
        timeMin,
        timeMax,
      });

      console.log("Find Events: ", findEvents);

      if (findEvents?.length) {
        return "Could not find events on Calendar";
      }
      const [findEventsResult] = findEvents.data.items?.map((event) => {
        return {
          id: event.id,
          status: event.status,
          htmlLink: event.htmlLink,
          summary: event.summary,
          start: event.start,
          end: event.end,
          kind: event.kind,
          eventType: event.eventType,
        };
      });
      const delRes = await calendar.events.delete({
        calendarId: "primary",
        eventId: findEventsResult.id,
      });

      return "Deleted the events successfully";
    } catch (error) {
      console.error("Failed to delete the events on Calendar: ", error);
      return "Something went wrong, Failed to delete the events on Calendar";
    }
  },
  {
    name: "find-delete-events",
    description: "Find and delete events from the calendar.",
    schema: z.object({
      q: z
        .string()
        .describe(
          "The query to be used to get events from google calender. It can be one of these values: summary, description, location, attendees display name, attendees email, organiser's email, organiser's name."
        ),
      timeMin: z
        .string()
        .describe("The From datetime in UTC format for the event"),
      timeMax: z.string().describe("Current IANA timezone string."),
    }),
  }
);

export const createEventTool = tool(
  async (params) => {
    try {
      console.log("Create Params ", params);
      const { end, start, summary } = params;

      const response = await calendar.events.insert({
        calendarId: "primary",
        sendUpdates: "all",
        extendedProperties: { private: { source: "leave-tracker-app" } },
        requestBody: {
          summary,
          start,
          end,
        },
      });

      console.log("Create Response: ", response?.data);
      const result = {
        id: response?.data?.id,
        status: response?.data?.status,
        htmlLink: response?.data?.htmlLink,
        summary: response?.data?.summary,
        start: response?.data?.start,
        end: response?.data?.end,
        kind: response?.data?.kind,
      };
      return result;
    } catch (error) {
      console.error("Failed to create the events on Calendar: ", error);
      return "Something went wrong, Failed to create the events on Calendar";
    }
  },
  {
    name: "create-events",
    description: "Call to create the calendar events",
    schema: z.object({
      summary: z.string().describe("The title of the event."),
      start: z.object({
        dateTime: z.string().describe("The start datetime of the event in UTC"),
        timeZone: z.string().describe("Current IANA timezone string"),
      }),
      end: z.object({
        dateTime: z.string().describe("The end datetime of the event in UTC"),
        timeZone: z.string().describe("Current IANA timezone string"),
      }),
    }),
  }
);

export const getEventTool = tool(
  async (params) => {
    try {
      console.log("Get events Params: ", params);
      const { q, timeMin, timeMax } = params;
      const response = await calendar.events.list({
        calendarId: "primary",
        q,
        timeMin,
        timeMax,
      });

      const result = response.data.items?.map((event) => {
        return {
          id: event.id,
          status: event.status,
          htmlLink: event.htmlLink,
          summary: event.summary,
          start: event.start,
          end: event.end,
          kind: event.kind,
          eventType: event.eventType,
        };
      });
      console.log("Get events Response: ", result);
      return JSON.stringify(result);
    } catch (error) {
      console.error("Failed to get the events from Calendar: ", error);
      return "Something went wrong, Failed to get the events from Calendar";
    }
  },
  {
    name: "get-event",
    description: "Call to get the calendar events.",
    schema: z.object({
      q: z
        .string()
        .describe(
          "The query to be used to get events from google calender. It can be one of these values: summary, description, location, attendees display name, attendees email, organiser's email, organiser's name."
        ),
      timeMin: z
        .string()
        .describe("The From datetime in UTC format for the event"),
      timeMax: z.string().describe("Current IANA timezone string."),
    }),
  }
);
