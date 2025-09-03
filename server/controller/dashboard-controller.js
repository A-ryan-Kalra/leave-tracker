import { calendar } from "../app.js";
import { prisma } from "../util/db.js";
import errorHandler from "../util/error-handler.js";
import { differenceInCalendarDays } from "date-fns";
import { sendMail } from "../util/mailer.js";
export const listUserLeaveType = async (req, res, next) => {
  const { id } = req.params;
  try {
    const userLeaveTypes = await prisma.userLeaveType.findMany({
      where: {
        userId: id,
        isActive: true,
        leaveType: { isDeleted: false }, // keep reference rows
      },
      select: {
        isActive: true,
        leaveBalance: true,
        leaveType: {
          select: {
            id: true,
            name: true,
            description: true,
            isActive: true,
            isDeleted: true,
          },
        },
      },
    });
    const totalBalance = await prisma.userLeaveType.aggregate({
      where: {
        userId: id,
        isActive: true, // only active assignments
        leaveType: { isDeleted: false }, // and non-deleted leave types
      },
      _sum: { leaveBalance: true },
    });
    return res.status(200).json({
      userLeaveTypes,
      totalBalance,
      message: "Success",
    });
  } catch (error) {
    next(errorHandler(500, error));
  }
};
export const addLeaveRequest = async (req, res, next) => {
  const { id } = req.params;
  const { leaveTypeId, startDate, endDate, reason } = req.body;
  // const days = differenceInCalendarDays(new Date(endDate), new Date(startDate));

  // console.log(days);
  try {
    const newRequest = await prisma.leaveRequest.create({
      data: {
        userId: id,
        leaveTypeId,
        startDate,
        endDate,
        reason,
        status: "PENDING",
      },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        leaveType: { select: { id: true, name: true } },
      },
    });

    const managers = await prisma.group.findMany({
      where: { members: { some: { userId: id } } },
      include: { manager: true },
    });

    const htmlManagers = `
  <h3>Leave Request</h3>
  <p><strong>Employee:</strong> ${newRequest.user.fullName}</p>
  <p><strong>Type:</strong> ${newRequest.leaveType.name}</p>
  <p><strong>Dates:</strong> ${startDate} → ${endDate}</p>
  <p><strong>Reason:</strong> ${reason}</p>
  <p>
    <a href="${process.env.APP_URL}/dashboard/approve-reject?id=${newRequest.id}&status=APPROVED" style="background:#4caf50;color:white;padding:8px 16px;text-decoration:none;border-radius:4px">Approve</a>
    <a href="${process.env.APP_URL}/dashboard/approve-reject?id=${newRequest.id}&status=REJECTED"  style="background:#f44336;color:white;padding:8px 16px;text-decoration:none;border-radius:4px">Reject</a>
  </p>`;
    await Promise.all(
      managers.map((g) => {
        sendMail({
          to: g.manager.email,
          subject: `Leave request from ${newRequest.user.fullName}`,
          html: htmlManagers,
        });
      })
    );

    // acknowledgement to the user
    await sendMail({
      to: newRequest.user.email,
      subject: "Leave request submitted",
      html: `<p>Your ${newRequest.leaveType.name} leave from ${startDate} to ${endDate} has been submitted and is awaiting approval.</p>`,
    });

    return res.status(201).json({
      newRequest,
      message: "Success",
    });
  } catch (error) {
    next(errorHandler(500, error));
  }
};

export const listLeaveRequest = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.query;
  // const days = differenceInCalendarDays(new Date(endDate), new Date(startDate));

  try {
    const leaveRequests = await prisma.leaveRequest.findMany({
      where: { userId: id, status },
      include: {
        leaveType: {
          select: { id: true, name: true, isActive: true, isDeleted: true },
        },
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            groups: {
              select: {
                group: {
                  select: {
                    id: true,
                    name: true,
                    manager: {
                      select: { id: true, fullName: true, email: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { requestedAt: "desc" },
    });

    return res.status(200).json({
      leaveRequests,
      message: "Success",
    });
  } catch (error) {
    next(errorHandler(500, error));
  }
};

export const cancelLeaveRequest = async (req, res, next) => {
  const { id } = req.params;
  const { leaveRequestId } = req.query;
  // const days = differenceInCalendarDays(new Date(endDate), new Date(startDate));

  try {
    const cancelled = await prisma.leaveRequest.update({
      where: {
        id: leaveRequestId, // the exact request
        userId: id, // ensure it belongs to the user
      },
      data: {
        status: "CANCELLED",
        updatedAt: new Date(),
      },
    });

    return res.status(200).json({
      cancelled,
      message: "Success",
    });
  } catch (error) {
    next(errorHandler(500, error));
  }
};
export const manageLeaveRequests = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.query;
  // const days = differenceInCalendarDays(new Date(endDate), new Date(startDate));

  try {
    let managers;
    // if (role === "MANAGER") {

    managers = await prisma.leaveRequest.findMany({
      where: {
        status,
        user: {
          groups: {
            some: {
              group: { managerId: id }, // user belongs to a group managed by this manager
            },
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        leaveType: {
          select: { id: true, name: true, isDeleted: true },
        },
      },
      orderBy: { requestedAt: "desc" },
    });
    // }

    return res.status(200).json({
      managers,
      message: "Success",
    });
  } catch (error) {
    next(errorHandler(500, error));
  }
};

export const approveLeaveRequest = async (req, res, next) => {
  const { id } = req.params;
  // const { status } = req.query;

  try {
    await prisma.$transaction(async (tx) => {
      // 1. fetch request details
      const request = await tx.leaveRequest.findUnique({
        where: { id },
        select: {
          userId: true,
          leaveTypeId: true,
          startDate: true,
          endDate: true,
          status: true,
          reason: true,
          leaveType: true,
          user: true,
        },
      });

      if (!request || request.status !== "PENDING") {
        throw new Error("Request not found or not pending");
      }

      // 2. compute days
      const days = differenceInCalendarDays(
        new Date(request.endDate),
        new Date(request.startDate)
      );

      // 3. update balance
      const leaveType = await tx.userLeaveType.update({
        where: {
          userId_leaveTypeId: {
            userId: request.userId,
            leaveTypeId: request.leaveTypeId,
          },
        },
        data: { leaveBalance: { decrement: days } },
      });

      // 4. mark approved
      const approved = await tx.leaveRequest.update({
        where: { id },
        data: { status: "APPROVED" }, // add gcalEventId here if you have it
      });
      const description = request.reason || "";

      const summary = `${request.leaveType.name} | ${
        request.user.fullName
      } | ${request.startDate.toISOString().slice(0, 10)} → ${request.endDate
        .toISOString()
        .slice(0, 10)}`;

      const { eventId } = await createCalendarEvent({
        summary,
        description,
        start: request.startDate,
        end: request.endDate,
      });

      console.log("eventId:\n", eventId);

      await tx.leaveRequest.update({
        where: { id },
        data: { gcalEventId: eventId },
      });

      return res.status(200).json({
        approved,
        message: "Success",
      });
    });
  } catch (error) {
    next(errorHandler(500, error));
  }
};

async function createCalendarEvent({ summary, start, end }) {
  const { data } = await calendar.events.insert({
    calendarId: "primary",
    resource: {
      summary,
      start: { dateTime: start, timeZone: "Asia/Kolkata" },
      end: { dateTime: end, timeZone: "Asia/Kolkata" },
      extendedProperties: { private: { source: "leave-tracker-app" } },
    },
  });
  return { eventId: data.id };
}

export const rejectLeaveRequest = async (req, res, next) => {
  const { id } = req.params;

  try {
    const reqRow = await prisma.leaveRequest.findUnique({
      where: { id },
      select: {
        userId: true,
        leaveTypeId: true,
        startDate: true,
        endDate: true,
        status: true,
        gcalEventId: true,
      },
    });

    if (!reqRow) return next(errorHandler(404, "Request not found"));

    const days = differenceInCalendarDays(
      new Date(reqRow.endDate),
      new Date(reqRow.startDate)
    );

    await prisma.$transaction(async (tx) => {
      // 1. refund balance only if it was previously approved
      if (reqRow.status === "APPROVED") {
        await tx.userLeaveType.update({
          where: {
            userId_leaveTypeId: {
              userId: reqRow.userId,
              leaveTypeId: reqRow.leaveTypeId,
            },
          },
          data: { leaveBalance: { increment: days } },
        });
      } else {
        // 2. mark rejected
        await tx.leaveRequest.update({
          where: { id },
          data: { status: "REJECTED", updatedAt: new Date() },
        });
      }

      // 3. delete calendar event if exists
      if (reqRow.gcalEventId) {
        await calendar.events.delete({
          calendarId: "primary",
          eventId: reqRow.gcalEventId,
        });
      }
    });

    res.status(200).json({ message: "Request rejected successfully" });
  } catch (error) {
    next(errorHandler(500, error));
  }
};
