class CustomErrorHandler extends Error {
  private statusCode: number;
  private msg: string;

  constructor(statusCode: number, msg: string) {
    super();
    this.statusCode = statusCode;
    this.msg = msg;
  }

  getStatusCode(): number {
    return this.statusCode;
  }
  getMessage(): string {
    return this.msg;
  }

  static alreadyExist(msg: string): CustomErrorHandler {
    return new CustomErrorHandler(409, msg);
  }

  static invalidCredentials(msg = "invalid credentials"): CustomErrorHandler {
    return new CustomErrorHandler(401, msg);
  }

  static unAuthorized(msg = "unAuthorized"): CustomErrorHandler {
    return new CustomErrorHandler(401, msg);
  }

  static notFound(msg = "404 Not Found"): CustomErrorHandler {
    return new CustomErrorHandler(404, msg);
  }

  static serverError(msg = "Internal server error"): CustomErrorHandler {
    return new CustomErrorHandler(500, msg);
  }
}

export default CustomErrorHandler;
