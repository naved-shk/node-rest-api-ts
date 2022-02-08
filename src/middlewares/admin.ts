import { Request, Response, NextFunction } from "express";
import { User } from "../models";
import { IUser } from "../models/user";
import CustomErrorHandler from "../services/CustomErrorHandler";

const admin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user: IUser | null = await User.findOne({ _id: req.user._id });

    if (user != null && user.role === "admin") {
      next();
    } else {
      return next(CustomErrorHandler.unAuthorized());
    }
  } catch (error) {
    return next(CustomErrorHandler.serverError());
  }
};

export default admin;
