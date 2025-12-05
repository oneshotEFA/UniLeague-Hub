import { Request, Response } from "express";
import { ApiResponseBuilder } from "../../common/utils/ApiResponse";
import { AuthService } from "./auth.service";
import { prisma } from "../../config/db";

const authService = new AuthService(prisma);

export class AuthController {
  static async signup(req: Request, res: Response) {
    const { username, fullName, email, password } = req.body;

    const result = await authService.signup(
      username,
      fullName,
      email,
      password
    );

    if (!result.ok) {
      return new ApiResponseBuilder().badRequest(result.error).build();
    }

    return new ApiResponseBuilder()
      .created("User created")
      .withData(result.data)
      .build();
  }
}
