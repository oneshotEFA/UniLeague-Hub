import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const connectDb = async () => {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    process.exit(1);
  }
};
connectDb();

export { prisma };
