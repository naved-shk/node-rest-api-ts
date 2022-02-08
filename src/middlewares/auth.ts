import { Request, Response, NextFunction } from "express";
import { ICurrenUser } from "../models/user";
import CustomErrorHandler from "../services/CustomErrorHandler";
import JwtService from "../services/JwtService";

const auth = async (req: Request, res: Response, next: NextFunction) => {
  let authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(CustomErrorHandler.unAuthorized());
  }

  const token = authHeader.split(" ")[1];

  try {
    const { _id, role } = await JwtService.verify(token);

    const user: ICurrenUser = {
      _id,
      role,
    };
    req.user = user;
    next();
  } catch (error) {
    return next(CustomErrorHandler.unAuthorized());
  }
};

export default auth;
