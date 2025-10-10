import { tool } from "@langchain/core/tools";
import z from "zod";
import { calendar } from "../app.js";

import { prisma } from "./db.js";
import { createCalendarEvent } from "../controller/dashboard-controller.js";
import { differenceInCalendarDays, parseJSON } from "date-fns";
import moment from "moment";

export const findAndDeleteEventTool = tool(
  async (params) => {
    try {
      const { q, userId } = params;
      const reqRow = await prisma.leaveRequest.findFirst({
        where: { description: q },
        select: {
          id: true,
          userId: true,
          leaveTypeId: true,
          startDate: true,
          endDate: true,
          status: true,
          gcalEventId: true,
          reason: true,
          leaveType: { select: { name: true } },
          user: { select: { fullName: true, email: true } },
        },
      });
      // if (!reqRow) return next(errorHandler(404, "Request not found"));

      const startDay = moment(reqRow.startDate).add(1, "day").toISOString();
      const endDay = moment(reqRow.endDate).add(2, "day").toISOString();
      const days = differenceInCalendarDays(endDay, startDay);

      // Update DB in transaction
      await prisma.$transaction(async (tx) => {
        if (reqRow.status === "APPROVED") {
          // Refund balance if it was previously approved
          await tx.userLeaveType.update({
            where: {
              userId_leaveTypeId: {
                userId: reqRow.userId,
                leaveTypeId: reqRow.leaveTypeId,
              },
            },
            data: { leaveBalance: { increment: days } },
          });
        }

        // Mark as rejected
        await tx.leaveRequest.updateMany({
          where: { description: q },
          data: {
            status: "REJECTED",
            updatedAt: new Date(),
            approvedById: userId,
          },
        });

        // Delete calendar event if exists
      });
      if (reqRow.gcalEventId) {
        try {
          await calendar.events.delete({
            calendarId: "primary",
            eventId: reqRow.gcalEventId,
          });
        } catch (err) {
          console.warn("Calendar event not found:", err.message);
        }
      }

      return "Deleted the events successfully";
    } catch (error) {
      console.error("Failed to delete the events on Calendar: ", error);
      return "Something went wrong, Failed to delete the events on Calendar";
    }
  },
  {
    name: "delete-events",
    description: "Find and delete events from the calendar.",
    schema: z.object({
      q: z
        .string()
        .describe(
          "The query to be used to get leave request of a user. It can be one of these values: createdAt,summary, description, location, attendees display name, attendees email, organiser's email, organiser's name."
        ),

      userId: z.string().describe("User Id"),
    }),
  }
);

export const createEventTool = tool(
  async (params) => {
    try {
      let request, approved, description;

      const { end, start, summary, role, userId, leaveType } = params;

      const startDay = moment(start.dateTime).add(0, "day").toISOString();
      const endDay = moment(end.dateTime).add(0, "day").toISOString();
      const days = differenceInCalendarDays(endDay, startDay);

      const findLeaveType = await prisma.leaveType.findFirst({
        where: {
          name: { contains: leaveType, mode: "insensitive" },
          isActive: true,
        },
      });
      const userLeaveType = await prisma.userLeaveType.findFirst({
        where: { userId, leaveTypeId: findLeaveType.id },
      });
      if (userLeaveType.leaveBalance <= days) {
        return "Oops, You don't have enough balance for applying this leave.";
      }

      // await createEvents(request, approved, description, leaveType.id, userId);

      await prisma.$transaction(async (tx) => {
        request = await tx.leaveRequest.create({
          data: {
            userId,
            leaveTypeId: findLeaveType.id,
            startDate: startDay,
            endDate: end.dateTime,
            reason: summary,
            status: "APPROVED",
            approvedById: userId,
          },
          select: {
            id: true,
            userId: true,
            leaveTypeId: true,
            startDate: true,
            endDate: true,
            status: true,
            reason: true,
            leaveType: { select: { name: true } },
            user: { select: { fullName: true, email: true } },
          },
        });

        await tx.userLeaveType.update({
          where: {
            userId_leaveTypeId: {
              userId: request.userId,
              leaveTypeId: request.leaveTypeId,
            },
          },
          data: { leaveBalance: { decrement: days } },
        });
      });
      // calendar event
      const summaryDetail = `${request.leaveType.name} | ${
        request.user.fullName
      } | ${request.startDate.toISOString().slice(0, 10)} → ${request.endDate
        .toISOString()
        .slice(0, 10)}`;

      await prisma.leaveRequest.update({
        where: { id: request.id },
        data: {
          description: summaryDetail,
        },
      });

      const { eventId, data } = await createCalendarEvent({
        summary: summaryDetail,
        start: request.startDate,
        end: request.endDate,
      });
      await prisma.leaveRequest.update({
        where: { id: request.id },
        data: { gcalEventId: eventId },
      });

      const startTime = moment(
        new Date(data.start.dateTime).toISOString().slice(0, 10)
      ).format("Do MMM YYYY");
      const endTime = moment(
        new Date(data.end.dateTime).toISOString().slice(0, 10)
      ).format("Do MMM YYYY");
      const newEvent = `Your leave request has been marked successfully\n
- The event "${
        data.summary
      }" is confirmed and will take place from ${startTime} through ${endTime} and It was created on ${moment(
        new Date(data.created).toISOString().slice(0, 10)
      ).format(
        "Do MMM YYYY"
      )}.\n\nYou can view it directly in your calendar using the event-specific link:\n<a class="show-link" href="${
        data.htmlLink
      }" target="_blank">Show Calender</a>
          `;

      return newEvent;
    } catch (error) {
      console.error("Failed to create the events on Calendar: ", error);
      return "Something went wrong, please try again or kindly make sure you are using the existing leave types from your balance.";
    }
  },
  {
    name: "create-events",
    description:
      "Call to create the calendar events and always make sure to ask for leavetype just in case user user does not mention.",
    schema: z.object({
      summary: z.string().describe("The title of the event."),
      userId: z.string().describe("The id of the user."),
      role: z.string().describe("The role of the user."),
      leaveType: z.string().describe("leave type"),
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
      const { q, timeMin, timeMax } = params;
      const response = await calendar.events.list({
        calendarId: "primary",
        q,
        timeMin,
        timeMax,
      });

      let prompt = response.data.items.map(
        (e, index) => {
          const startTime = moment(
            new Date(e.start.dateTime).toISOString().slice(0, 10)
          ).format("Do MMM YYYY");
          const endTime = moment(
            new Date(e.end.dateTime).toISOString().slice(0, 10)
          ).format("Do MMM YYYY");
          return `
${index + 1}. The event "${
            e.summary
          }" is confirmed and will take place from ${startTime} through ${endTime} and It was created on ${moment(
            new Date(e.created).toISOString().slice(0, 10)
          ).format(
            "Do MMM YYYY"
          )}.\n\nYou can view it directly in your calendar using the event-specific link:\n<a class="show-link" href="${
            e.htmlLink
          }" target="_blank">Show Calender</a>
          `;
        }
        //     `Event: ${e.summary}
        // Start : ${e.start.date}
        // End   : ${e.end.date}
        // Status: ${e.status}
        // Creator: ${e.creator?.email || "N/A"}
        // Link  : ${e.htmlLink}
        // Created: ${e.created}
        // Updated: ${e.updated}`
      );
      prompt.unshift("📅 Event Summary:\n");

      const changedPrompt = prompt.join("");

      return changedPrompt;
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
        .describe("The Min datetime is in UTC format for the event"),
      timeMax: z
        .string()
        .describe("The Max datetime is in UTC format for the event"),
      timeZone: z.string().describe("Current IANA timezone string."),
    }),
  }
);

export const getUserLeaveTool = tool(
  async (params) => {
    try {
      const { userId } = params;
      const leaveTypes = await prisma.userLeaveType.findMany({
        where: {
          userId: userId,
          isActive: true,
        },
        include: {
          leaveType: true,
          user: true,
        },
      });
      // console.log("leaveTypes: ", leaveTypes);

      const allLeaveType = leaveTypes?.map(
        (leave, index) =>
          `${index + 1}. Type: ${leave.leaveType.name}\t Balance: ${
            leave.leaveBalance
          }\n`
      );
      allLeaveType.unshift("Your Leaves:\n");

      const formattedLeaves = allLeaveType.join("");

      return formattedLeaves;
    } catch (error) {
      console.error("Failed to get the leavetType: ", error);
      return "Something went wrong, Failed to get the leavetType";
    }
  },
  {
    name: "get-user-leaves",
    description: "Always use userId to fetch the user's leave.",
    schema: z.object({
      userId: z.string().describe("User Id"),
    }),
  }
);
