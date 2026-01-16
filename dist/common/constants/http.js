"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpStatusMessage = exports.HttpStatusCode = void 0;
var HttpStatusCode;
(function (HttpStatusCode) {
    HttpStatusCode[HttpStatusCode["OK"] = 200] = "OK";
    HttpStatusCode[HttpStatusCode["CREATED"] = 201] = "CREATED";
    HttpStatusCode[HttpStatusCode["UNDER_PROCESS"] = 202] = "UNDER_PROCESS";
    HttpStatusCode[HttpStatusCode["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    HttpStatusCode[HttpStatusCode["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
    HttpStatusCode[HttpStatusCode["FORBIDDEN"] = 403] = "FORBIDDEN";
    HttpStatusCode[HttpStatusCode["NOT_FOUND"] = 404] = "NOT_FOUND";
    HttpStatusCode[HttpStatusCode["CONFLICT"] = 409] = "CONFLICT";
    HttpStatusCode[HttpStatusCode["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
})(HttpStatusCode || (exports.HttpStatusCode = HttpStatusCode = {}));
exports.HttpStatusMessage = {
    [HttpStatusCode.OK]: "Success",
    [HttpStatusCode.UNDER_PROCESS]: "Under process",
    [HttpStatusCode.CREATED]: "Resource created successfully",
    [HttpStatusCode.BAD_REQUEST]: "Bad request",
    [HttpStatusCode.UNAUTHORIZED]: "Unauthorized",
    [HttpStatusCode.FORBIDDEN]: "Forbidden",
    [HttpStatusCode.NOT_FOUND]: "Resource not found",
    [HttpStatusCode.CONFLICT]: "Conflict occurred",
    [HttpStatusCode.INTERNAL_SERVER_ERROR]: "Internal server error",
};
