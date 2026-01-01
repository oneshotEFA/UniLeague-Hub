import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
export const reqAuth = (req: Request, res: Response, next: NextFunction) => {
  const jwtKey = process.env.ACCESS_SECRET || "";
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "No token provided" });
    return;
  }
  const token = authHeader.split(" ")[1];
  try {
    const decode = jwt.verify(token, jwtKey);
    (req as any).user = decode;
    next();
  } catch (error) {
    res
      .status(403)
      .json({ success: false, message: "Invalid or expired token" });
    return;
  }
};
