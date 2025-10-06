import { tool } from "@langchain/core/tools";
import z from "zod";
export const getEventTool = tool(
  async (params) => {
    console.log("Params: ", params);
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
      timeMax: z
        .string()
        .describe("The To datetime in UTC format for the event"),
    }),
  }
);
