import { prisma } from "../../database/prisma";

export const login = async () => {
  try {
    const res = await prisma.admin.findMany();

    return "hii";
  } catch (error) {
    console.log(error);
  }
};
