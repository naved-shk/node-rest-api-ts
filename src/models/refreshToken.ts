import { Schema, model, Model, Document } from "mongoose";

interface IRefreshToken extends Document {
  token: string;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    token: { type: String, unquie: true },
  },
  { timestamps: false }
);

const RefreshToken: Model<IRefreshToken> = model(
  "RefreshToken",
  refreshTokenSchema,
  "refreshTokens"
);

export default RefreshToken;
