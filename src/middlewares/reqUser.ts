import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ApiResponseBuilder } from "../common/utils/ApiResponse";
export const reqUser = (req: Request, res: Response, next: NextFunction) => {
  const jwtKey = process.env.REGISTRATION_SECRET || "";
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new ApiResponseBuilder().forbidden("No token provided").build(res);
  }
  const token = authHeader.split(" ")[1];
  try {
    const decode = jwt.verify(token, jwtKey);
    (req as any).user = decode;
    next();
  } catch (error) {
    return new ApiResponseBuilder()
      .unauthorized("Invalid or expired token")
      .build(res);
  }
};
