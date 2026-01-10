"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = void 0;
const ApiResponse_1 = require("../common/utils/ApiResponse");
const notFound = (req, res) => {
    const resData = new ApiResponse_1.ApiResponseBuilder()
        .notFound("Resource not found")
        .build(res);
    res.status(404).json(resData);
};
exports.notFound = notFound;
