import jwt from "jsonwebtoken";
import config from "../config";

export const generateToken = (payload: { id: number }) => {
  return jwt.sign(payload, config.jwt.secret as string, {
    expiresIn: "1d",
  });
};
