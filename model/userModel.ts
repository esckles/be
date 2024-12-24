import { Document, model, Schema } from "mongoose";

interface iUser {
  userName: string;
  email: string;
  password: string;
  isVerified: boolean;
  verifiedToken: string;
}

interface iUserData extends iUser, Document {}

const userModel = new Schema<iUserData>({
  userName: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  isVerified: {
    type: Boolean,
  },
  verifiedToken: {
    type: String,
  },
});

export default model<iUserData>("users", userModel);
