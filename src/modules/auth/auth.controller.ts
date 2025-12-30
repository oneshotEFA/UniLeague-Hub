import { Request, Response } from "express";
import { ApiResponseBuilder } from "../../common/utils/ApiResponse";
import { AuthService } from "./auth.service";

const authService = new AuthService();

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
      return new ApiResponseBuilder().badRequest(result.error).build(res);
    }

    return new ApiResponseBuilder()
      .created("User created")
      .withData(result.data)
      .build(res);
  }
  static async login(req: Request, res: Response) {
    const { username, password } = req.body;

    const result = await authService.login(username, password);

    if (!result.ok) {
      return new ApiResponseBuilder().badRequest(result.error).build(res);
    }

    return new ApiResponseBuilder()
      .created("login successful")
      .withData(result.data)
      .build(res);
  }
}
