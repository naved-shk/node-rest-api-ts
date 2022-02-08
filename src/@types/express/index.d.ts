import {ICurrentUser} from "../../models";

declare global {
  var appRoot: string;

  namespace Express {
    interface Request {
      user: ICurrentUser;
    }
  }
}
