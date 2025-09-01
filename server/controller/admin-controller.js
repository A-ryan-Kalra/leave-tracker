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
    errorHandler(error);
  }
};
