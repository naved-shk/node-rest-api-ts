import Joi from "joi";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import { User, RefreshToken } from "../../models";
import { Request, Response, NextFunction } from "express";

import bcrypt from "bcrypt";
import JwtService from "../../services/JwtService";
import { REFRESH_SECRET } from "../../config";

async function register(req: Request, res: Response, next: NextFunction) {
  // validation
  const registerSchema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string()
      .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
      .required(),
    repeat_password: Joi.ref("password"),
  });

  const { error } = registerSchema.validate(req.body);

  if (error) {
    return next(error);
  }

  // Check if user already exits in DB
  try {
    const exist = await User.exists({ email: req.body.email });
    console.log(exist);
    if (exist) {
      return next(
        CustomErrorHandler.alreadyExist("This email is already taken.")
      );
    }
  } catch (error) {
    return next(error);
  }

  const { name, email, password } = req.body;

  // Hash-password
  const hashedPasword = await bcrypt.hash(password, 10);

  // Prepare the Model
  const user = new User({
    name: name,
    email: email,
    password: hashedPasword,
  });

  let accessToken;
  let refreshToken;

  try {
    const reslut = await user.save();

    // Token
    accessToken = JwtService.sign({ _id: reslut._id, role: reslut.role });
    refreshToken = JwtService.sign(
      { _id: reslut._id, role: reslut.role },
      "1y",
      REFRESH_SECRET
    );

    // Database whilelist
    await RefreshToken.create({ token: refreshToken });
  } catch (error) {
    return next(error);
  }

  res.json({
    access_Token: accessToken,
    refresh_token: refreshToken,
  });
}

export default { register };
