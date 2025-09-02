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

    console.log(allUsers);
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

    console.log(data);
    return res.status(200).json({
      data,
      message: "Success",
    });
  } catch (error) {
    next(errorHandler(500, error));
  }
};
