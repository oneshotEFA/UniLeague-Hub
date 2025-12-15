import { Request, Response, NextFunction } from "express";
import { ApiResponseBuilder } from "../common/utils/ApiResponse";
import { HttpStatusCode } from "../common/constants/http";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("🔥 Error:", err);

  const status = err.status || HttpStatusCode.INTERNAL_SERVER_ERROR;

  const response = new ApiResponseBuilder()
    .badRequest("An unexpected error occurred")
    .build(res);

  return res.status(status).json(response);
};