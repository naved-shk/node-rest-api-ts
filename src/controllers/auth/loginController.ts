import Joi from "joi";
import { User, RefreshToken } from "../../models";
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import JwtService from "../../services/JwtService";
import { REFRESH_SECRET } from "../../config";

async function login(req: Request, res: Response, next: NextFunction) {
  // Validation
  const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string()
      .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
      .required(),
  });

  const { error } = loginSchema.validate(req.body);
  if (error) {
    return next(error);
  }

  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return next(CustomErrorHandler.invalidCredentials());
    }

    // Compare password
    const match = await bcrypt.compare(req.body.password, user.password);

    if (!match) {
      return next(CustomErrorHandler.invalidCredentials());
    }

    // Token
    const accessToken = JwtService.sign({ _id: user._id, role: user.role });
    const refreshToken = JwtService.sign(
      { _id: user._id, role: user.role },
      "1y",
      REFRESH_SECRET
    );

    // Database whilelist
    await RefreshToken.create({ token: refreshToken });
    res.json({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  } catch (error) {
    return next(error);
  }
}

async function logout(req: Request, res: Response, next: NextFunction) {
  // Validation
  const refreshSchema = Joi.object({
    refresh_token: Joi.string().required(),
  });

  const { error } = refreshSchema.validate(req.body);

  if (error) {
    return next(error);
  }

  try {
    await RefreshToken.deleteOne({ token: req.body.refresh_token });
  } catch (error) {
    return next(new Error("Something went wrong in database"));
  }

  res.json({ status: 1 });
}

export default {
  login,
  logout,
};
