import bcrypt from "bcrypt";
import {config} from "../config";

const comparePassword = (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};

const createPassword = (password: string) => {
  return bcrypt.hash(password, config.saltRounds);
};

export { comparePassword, createPassword };