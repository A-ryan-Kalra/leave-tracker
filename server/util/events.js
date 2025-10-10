import { differenceInCalendarDays } from "date-fns";
import { prisma } from "./db.js";
import { sendMail } from "./mailer.js";
import { createCalendarEvent } from "../controller/dashboard-controller.js";
import moment from "moment";

export async function addLeaveRequestEvent(
  leaveTypeId,
  startDate,
  endDate,
  reason,
  id,
  newRequest
) {
  newRequest = await prisma.leaveRequest.create({
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
      .format("DD/MM/YYYY")} has been submitted and is awaiting approval.</p>`,
  });
}

export async function createEvents(
  request,
  approved,
  description,
  id,
  managerUserId
) {
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

  await prisma.leaveRequest.update({
    where: { id: request.id },
    data: {
      description: summary,
    },
  });
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
}

export async function rejectLeaveRequestEvent(
  reqRow,
  id,
  managerUserId,
  approvedData
) {
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
}

export async function cancelLeaveRequestEvent(id, leaveRequestId) {
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
        <h2 style="color:#f44336;">Leave Request Cancelled ❌</h2>
        <p>Hello ${reqRow.user.fullName},</p>
        <p>We regret to inform you that your <strong>${
          reqRow.leaveType.name
        }</strong> leave request has been <span style="color:#f44336;"><strong>cancelled</strong></span>.</p>
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
      subject: "❌ Your Leave Request has been Cancelled",
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
}
