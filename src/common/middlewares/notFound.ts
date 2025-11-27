import { Request, Response } from "express";
import { ApiResponseBuilder } from "../utils/ApiResponse";
import { HttpStatusCode } from "../constants/http";

export const notFound = (req: Request, res: Response) => {
  const resData = new ApiResponseBuilder()
    .error(HttpStatusCode.NOT_FOUND, "Route not found")
    .build();
  res.status(404).json(resData);
};
