export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER = 500,
}

export const HttpStatusMessage = {
  [HttpStatusCode.OK]: "Success",
  [HttpStatusCode.CREATED]: "Created successfully",
  [HttpStatusCode.BAD_REQUEST]: "Bad request",
  [HttpStatusCode.UNAUTHORIZED]: "Unauthorized access",
  [HttpStatusCode.FORBIDDEN]: "Forbidden",
  [HttpStatusCode.NOT_FOUND]: "Resource not found",
  [HttpStatusCode.INTERNAL_SERVER]: "Internal server error",
};
