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

  try {
    let request, approved;

    // DB transaction
    await prisma.$transaction(async (tx) => {
      request = await tx.leaveRequest.findUnique({
        where: { id },
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

      if (!request || request.status !== "PENDING") {
        throw new Error("Request not found or not pending");
      }

      const days =
        differenceInCalendarDays(
          new Date(request.endDate),
          new Date(request.startDate)
        ) + 1;

      await tx.userLeaveType.update({
        where: {
          userId_leaveTypeId: {
            userId: request.userId,
            leaveTypeId: request.leaveTypeId,
          },
        },
        data: { leaveBalance: { decrement: days } },
      });

      approved = await tx.leaveRequest.update({
        where: { id },
        data: { status: "APPROVED" },
      });
    });

    // --- AFTER TRANSACTION: external calls ---
    const description = request.reason || "";

    // email to employee
    const htmlEmployee = `
      <div style="font-family: Arial, sans-serif; line-height:1.5; color:#333;">
        <h2 style="color:#4caf50;">Leave Approved ✅</h2>
        <p>Hello ${request.user.fullName},</p>
        <p>Your <strong>${
          request.leaveType.name
        }</strong> leave request has been <span style="color:#4caf50;"><strong>approved</strong></span>.</p>
        <p>
          <strong>Dates:</strong> ${request.startDate
            .toISOString()
            .slice(0, 10)} →
          ${request.endDate.toISOString().slice(0, 10)}<br>
          <strong>Reason:</strong> ${description || "—"}
        </p>
        <p>Enjoy your time off!</p>
      </div>
    `;

    await sendMail({
      to: request.user.email,
      subject: "✅ Your Leave Request has been Approved",
      html: htmlEmployee,
    });

    // calendar event
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

    await prisma.leaveRequest.update({
      where: { id },
      data: { gcalEventId: eventId },
    });

    return res.status(200).json({
      approved,
      message: "Success",
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
    let reqRow;

    // Fetch request details
    reqRow = await prisma.leaveRequest.findUnique({
      where: { id },
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

    if (!reqRow) return next(errorHandler(404, "Request not found"));

    const days =
      differenceInCalendarDays(
        new Date(reqRow.endDate),
        new Date(reqRow.startDate)
      ) + 1;

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
      await tx.leaveRequest.update({
        where: { id },
        data: { status: "REJECTED", updatedAt: new Date() },
      });

      // Delete calendar event if exists
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
    });

    // --- AFTER TRANSACTION: send rejection email ---
    const description = reqRow.reason || "";

    const htmlEmployee = `
      <div style="font-family: Arial, sans-serif; line-height:1.5; color:#333;">
        <h2 style="color:#f44336;">Leave Rejected ❌</h2>
        <p>Hello ${reqRow.user.fullName},</p>
        <p>We regret to inform you that your <strong>${
          reqRow.leaveType.name
        }</strong> leave request has been <span style="color:#f44336;"><strong>rejected</strong></span>.</p>
        <p>
          <strong>Dates:</strong> ${reqRow.startDate
            .toISOString()
            .slice(0, 10)} →
          ${reqRow.endDate.toISOString().slice(0, 10)}<br>
          <strong>Reason Provided:</strong> ${description || "—"}
        </p>
        <p>If you have questions, please contact your manager.</p>
      </div>
    `;

    await sendMail({
      to: reqRow.user.email,
      subject: "❌ Your Leave Request has been Rejected",
      html: htmlEmployee,
    });

    return res.status(200).json({ message: "Request rejected successfully" });
  } catch (error) {
    next(errorHandler(500, error));
  }
};

export const listAllApprovedList = async (req, res, next) => {
  try {
    const { id } = req.query;
    // approved leave requests for one user
    const approvedLeaves = await prisma.leaveRequest.findMany({
      where: {
        userId: id, // ← the user you’re interested in
        status: "APPROVED",
      },
      include: {
        user: {
          select: {
            fullName: true,
          },
        },
        leaveType: true, // if you want the leave-type name, etc.
      },
      orderBy: { startDate: "asc" },
    });

    return res.status(200).json({
      approvedLeaves,
      message: "Request all approved leave successfully",
    });
  } catch (error) {
    next(errorHandler(500, error));
  }
};
