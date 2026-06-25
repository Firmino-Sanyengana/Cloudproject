import jwt from "jsonwebtoken";
const SECRET = process.env.JWT_SECRET || "dev-secret";
const EXP = process.env.JWT_EXPIRES_IN || "7d";
export const signToken = (payload) => jwt.sign(payload, SECRET, { expiresIn: EXP });
export const verifyToken = (token) => jwt.verify(token, SECRET);
