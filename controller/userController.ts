import { Request, Response } from "express";
import bcrypt, { genSalt } from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import userModel from "../model/userModel";

export const RegisterAccount = async (req: Request, res: Response) => {
  try {
    const { userName, email, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    const token = crypto.randomBytes(4).toString("hex");

    const user = await userModel.create({
      userName,
      email,
      password: hashed,
      verifiedToken: token,
    });
    return res.status(201).json({
      message: "Account created successfully",
      data: user,
      status: 201,
    });
  } catch (error) {
    return res
      .status(404)
      .json({ message: "Error creating Account", status: 404 });
  }
};

export const verifyAccount = async (req: Request, res: Response) => {
  try {
    const { userID } = req.params;
    const user = await userModel.findByIdAndUpdate(
      userID,
      {
        isVerified: true,
        verifiedToken: "",
      },
      { new: true }
    );
    return res
      .status(201)
      .json({ message: "Account verified", data: user, status: 201 });
  } catch (error) {
    return res
      .status(404)
      .json({ message: "Error verifying Account", status: 404 });
  }
};

export const LoginAccount = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (user) {
      const decryptedPassword = await bcrypt.compare(password, user.password);
      if (decryptedPassword) {
        if (user?.isVerified && user?.verifiedToken === "") {
          const token = jwt.sign(
            { id: user?._id },
            process.env.JWT_SECRET as string,
            { expiresIn: process.env.JWT_EXPIRES as string }
          );
          return res.status(201).json({
            message: "Welcome Back",
            data: token,
            status: 201,
          });
        } else {
          return res.status(404).json({
            message: "Error verifying user",
            status: 404,
          });
        }
      } else {
        return res.status(404).json({
          message: "Incorrect Password",
          status: 404,
        });
      }
    } else {
      return res.status(404).json({
        message: "Error with email",
        status: 404,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "error",
      status: 404,
    });
  }
};

export const readOneUser = async (req: Request, res: Response) => {
  try {
    const { userID } = req.params;
    const user = await userModel.findById(userID);
    return res.status(200).json({
      message: "One user read",
      data: user,
      status: 200,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error read one user",
      status: 404,
    });
  }
};
export const readAllUser = async (req: Request, res: Response) => {
  try {
    const user = await userModel.find();
    return res.status(200).json({
      message: "all user read",
      data: user,
      status: 200,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error all user",
      status: 404,
    });
  }
};

export const ForgetPasswod = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const token = await crypto.randomBytes(4).toString("hex");

    const user = await userModel.findOne({ email });

    if (user) {
      await userModel.findByIdAndUpdate(
        user?._id,
        {
          verifiedToken: token,
        },
        { new: true }
      );
      return res.status(200).json({
        message: "Email has been sent to you",
        status: 200,
      });
    } else {
      return res.status(404).json({
        message: "no account with such email",
        status: 404,
      });
    }
  } catch (error) {}
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { userID } = req.params;
    const { password } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    if (userID) {
      await userModel.findByIdAndUpdate(
        userID,
        {
          isVerified: "",
          password: hashed,
        },
        { new: true }
      );
      return res.status(200).json({
        message: "password change successfully",
        status: 200,
      });
    } else {
      return res.status(404).json({
        message: "error change password",
        status: 404,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "error",
      status: 404,
    });
  }
};
