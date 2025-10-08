import { calendar } from "../app.js";
import { prisma } from "../util/db.js";
import errorHandler from "../util/error-handler.js";
import { differenceInCalendarDays } from "date-fns";
import { sendMail } from "../util/mailer.js";
import jwt from "jsonwebtoken";
import moment from "moment";
import {
  cancelLeaveRequestEvent,
  createEvents,
  rejectLeaveRequestEvent,
} from "../util/events.js";
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
    .subtract(0, "day")
    .format("DD/MM/YYYY")} →  ${moment(endDate)
          .subtract(0, "day")
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
        .subtract(0, "day")
        .format("DD/MM/YYYY")} to  ${moment(endDate)
        .subtract(0, "day")
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
    await cancelLeaveRequestEvent(id, leaveRequestId);
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

    await createEvents(request, approved, description, id, managerUserId);

    return res.status(200).json({
      approved,
      message: "Success",
    });
  } catch (error) {
    next(errorHandler(500, error));
  }
};

export async function createCalendarEvent({ summary, start, end }) {
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
  const { id } = req?.params;

  const { managerUserId } = req.query;
  try {
    let reqRow;
    let approvedData;

    // Fetch request details
    await rejectLeaveRequestEvent(reqRow, id, managerUserId, approvedData);
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
    const { email } = req.query;

    const deleteUser = await prisma.user.delete({ where: { email } });

    return res.status(200).json({
      deleteUser,
      message: "Success",
    });
  } catch (error) {
    next(errorHandler(500, error));
  }
};
