import { prisma } from "../util/db.js";
import errorHandler from "../util/error-handler.js";

export const listAllUsers = async (req, res) => {
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

export const addMemberToManager = async (req, res) => {
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
