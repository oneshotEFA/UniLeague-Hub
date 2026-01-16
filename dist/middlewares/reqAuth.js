"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reqAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ApiResponse_1 = require("../common/utils/ApiResponse");
const reqAuth = (req, res, next) => {
    const jwtKey = process.env.ACCESS_SECRET || "";
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return new ApiResponse_1.ApiResponseBuilder().forbidden("No token provided").build(res);
    }
    const token = authHeader.split(" ")[1];
    try {
        const decode = jsonwebtoken_1.default.verify(token, jwtKey);
        req.user = decode;
        next();
    }
    catch (error) {
        return new ApiResponse_1.ApiResponseBuilder()
            .unauthorized("Invalid or expired token")
            .build(res);
    }
};
exports.reqAuth = reqAuth;
