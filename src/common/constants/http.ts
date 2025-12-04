export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  UNDER_PROCESS = 202,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
}

export const HttpStatusMessage: Record<HttpStatusCode, string> = {
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

export interface ApiResponseMeta {
  [key: string]: any;
}

export interface ApiResponseObject<T> {
  success: boolean;
  statusCode: HttpStatusCode;
  message: string;
  data?: T;
  meta?: ApiResponseMeta;
}
