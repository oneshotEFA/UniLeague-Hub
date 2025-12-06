import { Response } from "express";
import {
  ApiResponseMeta,
  ApiResponseObject,
  HttpStatusCode,
  HttpStatusMessage,
} from "../constants/http";

export class ApiResponseBuilder<T = any> {
  private statusCode: HttpStatusCode = HttpStatusCode.OK;
  private message: string = HttpStatusMessage[HttpStatusCode.OK];
  private data?: T;
  private meta?: ApiResponseMeta;

  ok(message?: string, data?: T) {
    this.statusCode = HttpStatusCode.OK;
    this.message = message || HttpStatusMessage[HttpStatusCode.OK];
    this.data = data;
    return this;
  }

  created(message?: string, data?: T) {
    this.statusCode = HttpStatusCode.CREATED;
    this.message = message || HttpStatusMessage[HttpStatusCode.CREATED];
    this.data = data;
    return this;
  }

  badRequest(message?: string) {
    this.statusCode = HttpStatusCode.BAD_REQUEST;
    this.message = message || HttpStatusMessage[HttpStatusCode.BAD_REQUEST];
    return this;
  }

  unauthorized(message?: string) {
    this.statusCode = HttpStatusCode.UNAUTHORIZED;
    this.message = message || HttpStatusMessage[HttpStatusCode.UNAUTHORIZED];
    return this;
  }

  forbidden(message?: string) {
    this.statusCode = HttpStatusCode.FORBIDDEN;
    this.message = message || HttpStatusMessage[HttpStatusCode.FORBIDDEN];
    return this;
  }

  notFound(message?: string) {
    this.statusCode = HttpStatusCode.NOT_FOUND;
    this.message = message || HttpStatusMessage[HttpStatusCode.NOT_FOUND];
    return this;
  }

  internalError(message?: string) {
    this.statusCode = HttpStatusCode.INTERNAL_SERVER_ERROR;
    this.message =
      message || HttpStatusMessage[HttpStatusCode.INTERNAL_SERVER_ERROR];
    return this;
  }

  withData(data: T) {
    this.data = data;
    return this;
  }

  withMeta(meta: ApiResponseMeta) {
    this.meta = meta;
    return this;
  }

  withMessage(message: string) {
    this.message = message;
    return this;
  }

  withStatus(code: HttpStatusCode) {
    this.statusCode = code;
    this.message = HttpStatusMessage[code];
    return this;
  }

  // >>> THIS IS THE FIX  <<<
  build(res: Response) {
    const body: ApiResponseObject<T> = {
      success: this.statusCode < 400,
      statusCode: this.statusCode,
      message: this.message,
      ...(this.data ? { data: this.data } : {}),
      ...(this.meta ? { meta: this.meta } : {}),
    };

    return res.status(this.statusCode).json(body);
  }
}
