//import { PrismaClientKnownRequestError } from "../../../generated/prisma/runtime/client";
import { ApiResponseBuilder } from "../../common/utils/ApiResponse";
import { getUserFriendlyError } from "../../common/utils/utility";
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
      const tid = user.tournaments?.[0]?.id ?? null;
      if (tid === null && user.role !== "superAdmin") {
        return {
          ok: false,
          error:
            "You are not authorized for tournament Management yet, or your eligibility has expired. Please contact the administrator for assistance.",
        };
      }
      const accessPayload = {
        id: user.id,
        username: user.username,
        role: user.role,
        tid,
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
  async updateUser(
    adminId: string,
    payload: {
      email?: string;
      username?: string;
      fullName?: string;
    }
  ) {
    if (!adminId) {
      return { ok: false, error: "Admin ID is required" };
    }
    const data: Record<string, string> = {};
    if (payload.email?.trim()) {
      data.email = payload.email.trim().toLowerCase();
    }
    if (payload.username?.trim()) {
      data.username = payload.username.trim();
    }
    if (payload.fullName?.trim()) {
      data.fullName = payload.fullName.trim();
    }
    if (Object.keys(data).length === 0) {
      return { ok: false, error: "No valid fields to update" };
    }

    try {
      const updatedAdmin = await this.prismaService.admin.update({
        where: { id: adminId },
        data,
        select: {
          id: true,
          email: true,
          username: true,
          fullName: true,
        },
      });

      return {
        ok: true,
        data: updatedAdmin,
      };
    } catch (error: any) {
      if (error.code === "P2002") {
        return {
          ok: false,
          error: "Email or username already in use",
        };
      }
      return {
        ok: false,
        error: error.message,
      };
    }
  }
  async getMe(id: string) {
    try {
      const res = await this.prismaService.admin.findUnique({
        where: { id: id },
        select: {
          id: true,
          username: true,
          fullName: true,
          email: true,
          tournaments: { select: { tournamentName: true } },
        },
      });
      if (!res) {
        return {
          ok: false,
          message: "no user found",
        };
      }
      return {
        ok: true,
        data: res,
      };
    } catch (error: any) {
      if (error.code === "P2002") {
        return {
          ok: false,
          error: "Email or username already in use",
        };
      }
      return {
        ok: false,
        error: error.message,
      };
    }
  }

  async changePassword(
    username: string,
    currentPassword: string,
    newPassword: string
  ) {
    try {
      const user = await this.prismaService.admin.findUnique({
        where: { username },
      });
      if (!user) {
        return {
          ok: false,
          error: "no admin in this user name",
        };
      }

      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isPasswordValid) {
      }
      const hasedPassword = await bcrypt.hash(newPassword, 10);
      const changedPassword = await this.prismaService.admin.update({
        where: { username },
        data: { password: hasedPassword },
      });

      return {
        ok: true,
        data: changedPassword,
      };
    } catch (error: any) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }
  async authPlayerRegistration(key: string) {
    try {
      const team = await this.prismaService.team.findUnique({
        where: { registrationKey: key },
      });
      if (!team) {
        return {
          ok: false,
          message: "No team found by this key",
        };
      }
      const today = new Date();
      today.setHours(0, 0, 0);
      if (!team.expiredRegistration) {
        return {
          ok: false,
          message: "Team not fully registered contact the manager",
        };
      }
      if (team.expiredRegistration < today) {
        return {
          ok: false,
          message: "registration date is expired",
        };
      }
      const accessPayload = {
        id: team.id,
      };
      const token = jwt.sign(accessPayload, process.env.REGISTRATION_SECRET!, {
        expiresIn: "30m",
      });
      return {
        ok: true,
        data: {
          id: team.id,
          aToken: token,
        },
      };
    } catch (error: any) {
      return {
        ok: false,
        message: getUserFriendlyError(error),
      };
    }
  }

  // coach login

  async coachLogin(password: string, teamName: string){
    try{
      if (!password || !teamName){
        return {
          ok: false,
          error: "all input are required"
        }
      }
      
      const team = await this.prismaService.team.findUnique({
        where: {teamName}
      });
      if (!team){
        return {
          ok: false,
          error: "no team found"
        }
      }
      const coach = await this.prismaService.team.findUnique({
        where: {teamName}
      })

      if (!coach){
        return {
          ok: false,
          error: "No coach is found"
        }
      }
      if (!coach.accessKey){
        return {
          ok: false,
          error: "the team have no any coach yet pls assign one"
        }
      }
      const isPasswordValid = await bcrypt.compare(password, coach.accessKey);
      if (!isPasswordValid){
        return {
          ok: false,
          error: "the password is wrong"
        }
      }
      const accessPayload = {
        teamName: teamName,
        tMid: team.id,
        role: "coach"
      };

      const token = jwt.sign(accessPayload, process.env.ACCESS_SECRET!, {
        expiresIn: "59m",
      });
      
      return {
        ok: true,
        data: {
          coachName: team.coachName,
          TeamName: team.teamName,
          aToken: token,
          tMid: accessPayload.tMid,
          role: "coach",
        }
      }
    }catch (error: any){
      return{
        ok: false,
        error: error.message
      }
    }
  }
}
