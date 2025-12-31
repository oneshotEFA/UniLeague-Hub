import crypto from "crypto";
export const generatePassword = (length = 12): String => {
  return crypto.randomBytes(length).toString("base64").slice(0, length);
};
