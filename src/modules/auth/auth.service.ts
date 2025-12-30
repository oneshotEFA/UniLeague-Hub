//import { PrismaClientKnownRequestError } from "../../../generated/prisma/runtime/client";
import { ApiResponseBuilder } from "../../common/utils/ApiResponse";
import { prisma } from "../../config/db.config";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
export class AuthService {
  constructor(private prismaService = prisma) {}

  async signup(
    username: string,
    fullName: string,
    email: string,
    password: string
  ) {
    try {
      const exists = await this.prismaService.admin.findFirst({
        where: { OR: [{ username }, { email }] },
      });

      if (exists) {
        return { ok: false, error: "User already exists" };
      }
      const hashed = await bcrypt.hash(password, 10);

      const user = await this.prismaService.admin.create({
        data: {
          username,
          fullName,
          email,
          password: hashed,
          role: "tournamentManager",
        },
      });

      return {
        ok: true,
        data: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
      };
    } catch (error: any) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }
  async login(username: string, password: string) {
    try {
      const user = await this.prismaService.admin.findUnique({
        where: { username },
        include: {
          tournaments: {
            select: { id: true },
          },
        },
      });

      if (!user) {
        return { ok: false, error: "Invalid Credential" };
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return { ok: false, error: "Invalid Credential" };
      }

      const accessPayload = {
        id: user.id,
        username: user.username,
        role: user.role,
        tid: user.tournaments[0].id,
      };

      const token = jwt.sign(accessPayload, process.env.ACCESS_SECRET!, {
        expiresIn: "59m",
      });

      const refreshPayload = { id: user.id };

      const refreshToken = jwt.sign(
        refreshPayload,
        process.env.REFRESH_SECRET!,
        { expiresIn: "7d" }
      );

      const hashedRefresh = await bcrypt.hash(refreshToken, 10);

      await this.prismaService.admin.update({
        where: { id: user.id },
        data: { refreshToken: hashedRefresh },
      });

      return {
        ok: true,
        data: {
          id: user.id,
          uName: user.username,
          aToken: token,
          rToken: refreshToken,
          tid: accessPayload.tid,
          role: user.role, // client needs this
        },
      };
    } catch (error) {
      return {
        ok: false,
        error: "An error occurred during login",
      };
    }
  }
}
