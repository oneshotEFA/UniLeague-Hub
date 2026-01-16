"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
require("dotenv/config");
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_1 = require("../../generated/prisma/client");
const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new adapter_pg_1.PrismaPg({ connectionString });
const prisma = new client_1.PrismaClient({ adapter });
exports.prisma = prisma;
const connectDb = async () => {
    try {
        await prisma.$connect();
        await prisma.$queryRaw `SELECT 1`;
        console.log("Database connected successfully");
    }
    catch (error) {
        console.error("Failed to connect to the database:", error);
        process.exit(1);
    }
};
connectDb();
