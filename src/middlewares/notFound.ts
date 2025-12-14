import { Request, Response } from "express";
import { ApiResponseBuilder } from "../common/utils/ApiResponse";
import { HttpStatusCode } from "../common/constants/http";

export const notFound = (req: Request, res: Response) => {
  const resData = new ApiResponseBuilder()
    .notFound("Resource not found")
    .build(res);
  res.status(404).json(resData);
};