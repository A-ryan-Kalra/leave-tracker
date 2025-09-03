import { prisma } from "../util/db.js";
import errorHandler from "../util/error-handler.js";
import { differenceInCalendarDays } from "date-fns";
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
        user: { select: { id: true, fullName: true } },
        leaveType: { select: { id: true, name: true } },
      },
    });

    return res.status(200).json({
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

    console.log(cancelled);
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
  console.log("id", id);
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
    console.log("managers:", managers);

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
      await tx.userLeaveType.update({
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

      return res.status(200).json({
        approved,
        message: "Success",
      });
    });
  } catch (error) {
    next(errorHandler(500, error));
  }
};

export const rejectLeaveRequest = async (req, res, next) => {
  const { id } = req.params;

  try {
    const rejected = await prisma.leaveRequest.update({
      where: { id },
      data: { status: "REJECTED", updatedAt: new Date() },
    });

    console.log(rejected);
    return res.status(200).json({
      rejected,
      message: "Success",
    });
  } catch (error) {
    next(errorHandler(500, error));
  }
};
