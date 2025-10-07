import { tool } from "@langchain/core/tools";
import z from "zod";
import { calendar } from "../app.js";

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
      return response?.data;
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
        };
      });
      console.log("Get events Response: ", response?.data?.items);
      return result;
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
