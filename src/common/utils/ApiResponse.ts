import { HttpStatusCode, HttpStatusMessage } from "../constants/http";

export class ApiResponseBuilder<T = any> {
  private statusCode: HttpStatusCode = HttpStatusCode.OK;
  private message: string = HttpStatusMessage[HttpStatusCode.OK];
  private data?: T;
  private meta?: any;

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

  error(code: HttpStatusCode, message?: string) {
    this.statusCode = code;
    this.message = message || HttpStatusMessage[code];
    return this;
  }

  withData(data: T) {
    this.data = data;
    return this;
  }

  withMeta(meta: any) {
    this.meta = meta;
    return this;
  }

  build() {
    return {
      success: this.statusCode < 400,
      statusCode: this.statusCode,
      message: this.message,
      ...(this.data !== undefined && { data: this.data }),
      ...(this.meta && { meta: this.meta }),
    };
  }
}
