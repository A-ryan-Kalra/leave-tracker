import { calendar } from "../app.js";
import { prisma } from "../util/db.js";
import errorHandler from "../util/error-handler.js";
import { differenceInCalendarDays } from "date-fns";
import { sendMail } from "../util/mailer.js";
import jwt from "jsonwebtoken";
import moment from "moment";
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
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            approvedLeaveRequests: { include: { approvedBy: true } },
          },
        },
        leaveType: { select: { id: true, name: true } },
      },
    });

    const managers = await prisma.group.findMany({
      where: { members: { some: { userId: id } } },
      include: { manager: true },
    });

    await Promise.all(
      managers.map((g) => {
        const htmlManagers = `
  <h3>Leave Request</h3>
  <p><strong>Employee:</strong> ${newRequest.user.fullName}</p>
  <p><strong>Type:</strong> ${newRequest.leaveType.name}</p>
  <p><strong>Dates:</strong>  ${moment(startDate)
    .subtract(1, "day")
    .format("DD/MM/YYYY")} →  ${moment(endDate)
          .subtract(1, "day")
          .format("DD/MM/YYYY")}</p>
  <p><strong>Reason:</strong> ${reason}</p>
  <p>
    <a href="${process.env.APP_URL}/dashboard/approve-reject?id=${
          newRequest.id
        }&status=APPROVED&managerUserId=${
          g.manager.id
        }" style="background:#4caf50;color:white;padding:8px 16px;text-decoration:none;border-radius:4px">Approve</a>
    <a href="${process.env.APP_URL}/dashboard/approve-reject?id=${
          newRequest.id
        }&status=REJECTED&managerUserId=${
          g.manager.id
        }"  style="background:#f44336;color:white;padding:8px 16px;text-decoration:none;border-radius:4px">Reject</a>
  </p>`;
        sendMail({
          from: newRequest.user.approvedLeaveRequests,
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
      html: `<p>Your ${newRequest.leaveType.name} leave from ${moment(startDate)
        .subtract(1, "day")
        .format("DD/MM/YYYY")} to  ${moment(endDate)
        .subtract(1, "day")
        .format(
          "DD/MM/YYYY"
        )} has been submitted and is awaiting approval.</p>`,
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
    const reqRow = await prisma.leaveRequest.findUnique({
      where: { id: leaveRequestId },
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

    const days = differenceInCalendarDays(
      new Date(reqRow.endDate),
      new Date(reqRow.startDate)
    );

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
      const approvedData = await tx.leaveRequest.update({
        where: { id: leaveRequestId },
        data: {
          status: "CANCELLED",
          updatedAt: new Date(),
          approvedById: id,
        },
        include: {
          user: { select: { fullName: true, email: true } },
          approvedBy: {
            select: { email: true },
          },
        },
      });
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
        from: approvedData.approvedBy.email,
        to: reqRow.user.email,
        subject: "❌ Your Leave Request has been Rejected",
        html: htmlEmployee,
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

    return res.status(200).json({
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
  const { managerUserId } = req.query;
  try {
    let request, approved, description;

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

      const days = differenceInCalendarDays(
        new Date(request.endDate),
        new Date(request.startDate)
      );

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
        data: { status: "APPROVED", approvedById: managerUserId },
        include: {
          approvedBy: {
            select: {
              fullName: true,
              email: true,
            },
          },
          user: {
            select: {
              email: true,
            },
          },
        },
      });
      // --- AFTER TRANSACTION: external calls ---
      description = request.reason || "";
    });

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
      from: approved.approvedBy.email,
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
  const { managerUserId } = req.query;
  let approvedData;
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

    const days = differenceInCalendarDays(
      new Date(reqRow.endDate),
      new Date(reqRow.startDate)
    );

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
      approvedData = await tx.leaveRequest.update({
        where: { id },
        data: {
          status: "REJECTED",
          updatedAt: new Date(),
          approvedById: managerUserId,
        },
        include: {
          user: { select: { fullName: true, email: true } },
          approvedBy: {
            select: { email: true },
          },
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
      from: approvedData.approvedBy.email,
      to: reqRow.user.email,
      subject: "❌ Your Leave Request has been Rejected",
      html: htmlEmployee,
    });

    // --- AFTER TRANSACTION: send rejection email ---

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

export const fetchUser = async (req, res, next) => {
  try {
    const { email, password } = req.query;

    const user = await prisma.user.findUnique({
      where: { email, password },
      select: {
        email: true,
        fullName: true,
        id: true,
        role: true,
        createdAt: true,
      },
    });

    const token = jwt.sign(
      {
        id: user.id,
        userEmail: user.email,
        userRole: user.role,
        fullName: user.fullName,
        createdAt: user.createdAt,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_TIMEOUT || "7d",
      }
    );
    req.headers.authorization = `Bearer ${token}`;

    return res.status(200).json({
      token,
      user,
      message: "Success",
    });
  } catch (error) {
    next(errorHandler(500, error));
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email } = req.query;
    console.log("id:", id);
    const deleteUser = await prisma.user.delete({ where: { email } });

    return res.status(200).json({
      deleteUser,
      message: "Success",
    });
  } catch (error) {
    next(errorHandler(500, error));
  }
};
