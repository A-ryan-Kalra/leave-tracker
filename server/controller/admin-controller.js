import { prisma } from "../util/db.js";
import errorHandler from "../util/error-handler.js";

export const listAllUsers = async (req, res, next) => {
  try {
    const allUsers = await prisma.user.findMany({
      orderBy: { fullName: "asc" },
    });

    return res.status(200).json({
      allUsers,
      message: "Success",
    });
  } catch (error) {
    next(errorHandler(500, error));
  }
};
export const assignManagers = async (req, res, next) => {
  try {
    const { choice } = req.query;
    const { id } = req.params;

    const switchRole = await prisma.$transaction([
      // delete every mapping where this user is the manager
      prisma.userManager.deleteMany({
        where: { managerId: id },
      }),

      // change the role
      prisma.user.update({
        where: { id },
        data: { role: choice === "TEAM_MEMBER" ? "MANAGER" : "TEAM_MEMBER" },
      }),
    ]);
    return res.status(200).json({
      switchRole,
      message: "Success",
    });
  } catch (error) {
    next(errorHandler(500, error));
  }
};

export const assignRoles = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, name } = req.body;

    const update = await prisma.user.update({
      where: { id },
      data: { role, fullName: name },
    });
    return res.status(200).json({
      update,
      message: "Success",
    });
  } catch (error) {
    next(errorHandler(500, error));
  }
};
export const addMemberToManager = async (req, res, next) => {
  try {
    const { users } = req.body;
    const exists = await prisma.userManager.findFirst({
      where: {
        managerId: req.params.id,
        memberId: { in: users ?? [] },
      },
    });

    if (exists) {
      throw new Error(
        `User ${exists.memberId} is already assigned to this manager.`
      );
    }

    const data = await prisma.userManager.createMany({
      data: users?.map((user) => ({
        managerId: req.params.id,
        memberId: user,
      })),
      skipDuplicates: true,
    });

    return res.status(200).json({
      data,
      message: "Success",
    });
  } catch (error) {
    next(errorHandler(500, error));
  }
};

export const fetchUsers = async (req, res, next) => {
  try {
    const allUsers = await prisma.user.findMany({
      where: {
        managedBy: {
          some: { managerId: req.params.id }, // managerId is the id of the manager you care about
        },
      },
      select: { id: true, email: true, fullName: true },
    });

    return res.status(200).json({
      allUsers,
      message: "Success",
    });
  } catch (error) {
    next(errorHandler(500, error));
  }
};
export const createProjects = async (req, res, next) => {
  try {
    const { projectName, groupName, managerId, userIds } = req.body;

    const data = await prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: { name: projectName },
      });

      const group = await tx.group.create({
        data: {
          name: groupName,
          projectId: project.id,
          managerId,
        },
      });

      await tx.userGroup.createMany({
        data: userIds.map((userId) => ({ userId, groupId: group.id })),
        skipDuplicates: true,
      });
    });

    return res.status(200).json({
      data,
      message: "Success",
    });
  } catch (error) {
    next(errorHandler(500, error));
  }
};
export const listALlProjects = async (req, res, next) => {
  try {
    const result = await prisma.group.findMany({
      select: {
        id: true,
        name: true,
        managerId: true,
        manager: { select: { fullName: true, email: true } },
        project: { select: { id: true, name: true } },
        members: { select: { userId: true } }, // UserGroup rows
      },
      orderBy: { createdAt: "asc" },
    });

    return res.status(200).json({
      result,
      message: "Success",
    });
  } catch (error) {
    next(errorHandler(500, error));
  }
};
export const listProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const group = await prisma.group.findUnique({
      where: { id }, // or { name: groupName }
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
        managerId: true,
        manager: { select: { id: true, fullName: true, email: true } },
        project: { select: { id: true, name: true } },
        members: {
          select: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    return res.status(200).json({
      group,
      message: "Success",
    });
  } catch (error) {
    next(errorHandler(500, error));
  }
};
export const updateGroup = async (req, res, next) => {
  try {
    const { groupId, newProjectName, newGroupName, newManagerId, userIds } =
      req.body;

    const group = await prisma.$transaction(async (tx) => {
      // 1. fetch the group so we know its current project
      const group = await tx.group.findUnique({ where: { id: groupId } });
      if (!group) throw new Error("Group not found");

      // 2. update the project name
      await tx.project.update({
        where: { id: group.projectId },
        data: { name: newProjectName },
      });

      // 3. update the group itself
      await tx.group.update({
        where: { id: groupId },
        data: {
          name: newGroupName,
          managerId: newManagerId,
        },
      });

      // 4. replace the member list with the new set
      await tx.userGroup.deleteMany({ where: { groupId } });
      if (userIds?.length) {
        await tx.userGroup.createMany({
          data: userIds?.map((userId) => ({ userId, groupId })),
        });
      }
    });

    return res.status(200).json({
      group,
      message: "Success",
    });
  } catch (error) {
    next(errorHandler(500, error));
  }
};

export const addLeaveType = async (req, res, next) => {
  try {
    const { name, status, description } = req.body;

    const newLeaveType = await prisma.leaveType.create({
      data: {
        name,
        description,
        isActive: status,
      },
    });

    return res.status(201).json({
      newLeaveType,
      message: "Success",
    });
  } catch (error) {
    next(errorHandler(500, error));
  }
};
export const listLeaveType = async (req, res, next) => {
  try {
    const leaveTypes = await prisma.leaveType.findMany({
      orderBy: { name: "asc" },
      where: {
        isDeleted: false,
      },
    });

    return res.status(200).json({
      leaveTypes,
      message: "Success",
    });
  } catch (error) {
    next(errorHandler(500, error));
  }
};

export const updateLeaveType = async (req, res, next) => {
  try {
    const { payload } = req.body;
    const { id } = req.params;

    const updated = await prisma.$transaction(async (tx) => {
      // 1. update the master LeaveType
      await tx.leaveType.update({ where: { id }, data: payload });

      if (payload.isActive !== undefined) {
        await tx.userLeaveType.updateMany({
          where: { leaveTypeId: id },
          data: { isActive: payload.isActive },
        });
      }
    });
    // const updated = await prisma.leaveType.update({
    //   where: { id },
    //   data: payload,
    // });

    return res.status(200).json({
      updated,
      message: "Success",
    });
  } catch (error) {
    next(errorHandler(500, error));
  }
};
export const deleteLeaveType = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await prisma.leaveType.update({
      where: { id },
      data: { isDeleted: true, isActive: false }, // hide everywhere
    });

    return res.status(200).json({
      deleted,
      message: "Success",
    });
  } catch (error) {
    next(errorHandler(500, error));
  }
};
export const fetchLeaveTypeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const leaveType = await prisma.leaveType.findUnique({
      where: { id: id }, // or where: { name: leaveTypeName }
    });

    return res.status(200).json({
      leaveType,
      message: "Success",
    });
  } catch (error) {
    next(errorHandler(500, error));
  }
};
export const getUserDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userData = await prisma.user.findUnique({
      where: { id: id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
        assignedTypes: {
          where: {
            leaveType: { isDeleted: false }, // ← filter out soft-deleted types
          },
          select: {
            leaveBalance: true,
            isActive: true,
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
        },
      },
    });

    return res.status(200).json({
      userData,
      message: "Success",
    });
  } catch (error) {
    next(errorHandler(500, error));
  }
};

export const addUserLeaveType = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { leaveTypeId, leaveBalance, isActive } = req.body;

    const userLeaveType = await prisma.userLeaveType.create({
      data: {
        userId: id,
        leaveTypeId: leaveTypeId,
        leaveBalance: leaveBalance,
        isActive,
      },
    });

    return res.status(200).json({
      userLeaveType,
      message: "Success",
    });
  } catch (error) {
    next(errorHandler(500, error));
  }
};
export const updateUserLeaveType = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { leaveTypeId, leaveBalance, isActive } = req.body;
    console.log("check!", { leaveTypeId, leaveBalance, isActive });

    const updateData = {};

    if (leaveBalance) {
      updateData.leaveBalance = leaveBalance;
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }
    const type = await prisma.leaveType.findUnique({
      where: { id: leaveTypeId },
      select: { isActive: true },
    });

    if (!type || !type.isActive) {
      throw new Error("This Leave type is inactive for everyone");
    }

    const updatedUserLeaveType = await prisma.userLeaveType.update({
      where: {
        userId_leaveTypeId: {
          userId: id, // target user
          leaveTypeId: leaveTypeId, // target leave type
        },
      },
      data: updateData,
    });

    console.log("Updated userLeaveType:", updatedUserLeaveType);
    return res.status(200).json({
      updatedUserLeaveType,
      message: "Success",
    });
  } catch (error) {
    next(errorHandler(500, error));
  }
};

export const deleteUserLeaveType = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { leaveTypeId } = req.body;

    const deleted = await prisma.userLeaveType.delete({
      where: {
        userId_leaveTypeId: {
          userId: id,
          leaveTypeId: leaveTypeId,
        },
      },
    });

    return res.status(200).json({
      deleted,
      message: "Success",
    });
  } catch (error) {
    next(errorHandler(500, error));
  }
};
