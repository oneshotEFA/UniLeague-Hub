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
      return res
        .status(400)
        .json(new ApiResponseBuilder().badRequest(result.error).build());
    }

    return res
      .status(201)
      .json(
        new ApiResponseBuilder()
          .created("User created")
          .withData(result.data)
          .build()
      );
  }
}
