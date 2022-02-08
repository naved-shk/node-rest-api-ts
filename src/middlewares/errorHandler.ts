import { Request, Response, NextFunction } from "express";
import { DEBUG_MODE } from "../config";
import { ValidationError } from "joi";
import CustomErrorHandler from "../services/CustomErrorHandler";

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  CustomErrorHandler;
  let data = {
    message: "Internal server error",
    ...(DEBUG_MODE === "true" && { originalError: err.message }),
  };

  if (err instanceof ValidationError) {
    statusCode = 422;
    data = {
      message: err.message,
    };
  }

  if (err instanceof CustomErrorHandler) {
    (statusCode = err.getStatusCode()),
      (data = {
        message: err.getMessage(),
      });
  }

  return res.status(statusCode).json(data);
};

export default errorHandler;
