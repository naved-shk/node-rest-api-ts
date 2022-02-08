import { JWT_SECRET } from "../config";
import jwt from "jsonwebtoken";
const { sign, verify } = jwt;

class JwtService {
  static sign(
    payload: IUserPayload,
    expiry: string = "60s",
    secret: string = JWT_SECRET as string
  ) {
    return sign(payload, secret, { expiresIn: expiry });
  }

  static verify(token: string, secret: string = JWT_SECRET as string): IUserPayload {
    return verify(token, secret) as IUserPayload;
  }
}

interface IUserPayload {
  _id: string,
  role: string
}


export default JwtService;
