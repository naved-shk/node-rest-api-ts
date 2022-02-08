import Joi from "joi";
import { Request, Response, NextFunction } from "express";
import { REFRESH_SECRET } from "../../config";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import JwtService from "../../services/JwtService";
import { User, RefreshToken } from "../../models";
import { IUser } from "../../models/user";

async function refresh(req: Request, res: Response, next: NextFunction) {
  // Validation

  const refreshSchema = Joi.object({
    refresh_token: Joi.string().required(),
  });

  const { error } = refreshSchema.validate(req.body);

  if (error) {
    return next(error);
  }

  // Database
  let refreshToken;
  try {
    refreshToken = await RefreshToken.findOne({
      token: req.body.refresh_token,
    });
    if (!refreshToken) {
      return next(CustomErrorHandler.unAuthorized("Invalid refresh token"));
    }

    let userId;

    try {
      const { _id } = await JwtService.verify(
        refreshToken.token,
        REFRESH_SECRET
      );
      userId = _id;
    } catch (error) {
      return next(CustomErrorHandler.unAuthorized("Invalid refresh token"));
    }

    const user: IUser | null = await User.findOne({ _id: userId });

    if (!user) {
      return next(CustomErrorHandler.unAuthorized("No user found!"));
    }

    // Token
    const access_token = JwtService.sign({ _id: user._id, role: user.role });
    const refresh_token = JwtService.sign(
      { _id: user._id, role: user.role },
      "1y",
      REFRESH_SECRET
    );

    // Database whilelist
    await RefreshToken.create({ token: refreshToken });
    res.json({
      access_token,
      refresh_token,
    });
  } catch (error: any) {
    return next(new Error(`Someting went wrong  ${error.message}`));
  }
}

export default { refresh };
