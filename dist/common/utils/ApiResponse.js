"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponseBuilder = void 0;
const http_1 = require("../constants/http");
class ApiResponseBuilder {
    constructor() {
        this.statusCode = http_1.HttpStatusCode.OK;
        this.message = http_1.HttpStatusMessage[http_1.HttpStatusCode.OK];
    }
    ok(message, data) {
        this.statusCode = http_1.HttpStatusCode.OK;
        this.message = message || http_1.HttpStatusMessage[http_1.HttpStatusCode.OK];
        this.data = data;
        return this;
    }
    created(message, data) {
        this.statusCode = http_1.HttpStatusCode.CREATED;
        this.message = message || http_1.HttpStatusMessage[http_1.HttpStatusCode.CREATED];
        this.data = data;
        return this;
    }
    badRequest(message) {
        this.statusCode = http_1.HttpStatusCode.BAD_REQUEST;
        this.message = message || http_1.HttpStatusMessage[http_1.HttpStatusCode.BAD_REQUEST];
        return this;
    }
    unauthorized(message) {
        this.statusCode = http_1.HttpStatusCode.UNAUTHORIZED;
        this.message = message || http_1.HttpStatusMessage[http_1.HttpStatusCode.UNAUTHORIZED];
        return this;
    }
    forbidden(message) {
        this.statusCode = http_1.HttpStatusCode.FORBIDDEN;
        this.message = message || http_1.HttpStatusMessage[http_1.HttpStatusCode.FORBIDDEN];
        return this;
    }
    notFound(message) {
        this.statusCode = http_1.HttpStatusCode.NOT_FOUND;
        this.message = message || http_1.HttpStatusMessage[http_1.HttpStatusCode.NOT_FOUND];
        return this;
    }
    internalError(message) {
        this.statusCode = http_1.HttpStatusCode.INTERNAL_SERVER_ERROR;
        this.message =
            message || http_1.HttpStatusMessage[http_1.HttpStatusCode.INTERNAL_SERVER_ERROR];
        return this;
    }
    withData(data) {
        this.data = data;
        return this;
    }
    withMeta(meta) {
        this.meta = meta;
        return this;
    }
    withMessage(message) {
        this.message = message;
        return this;
    }
    withStatus(code) {
        this.statusCode = code;
        this.message = http_1.HttpStatusMessage[code];
        return this;
    }
    // >>> THIS IS THE FIX  <<<
    build(res) {
        const body = {
            success: this.statusCode < 400,
            statusCode: this.statusCode,
            message: this.message,
            ...(this.data ? { data: this.data } : {}),
            ...(this.meta ? { meta: this.meta } : {}),
        };
        return res.status(this.statusCode).json(body);
    }
}
exports.ApiResponseBuilder = ApiResponseBuilder;
