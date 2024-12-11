import argon2 from "argon2";

const comparePassword = async (password: string, hash: string) => {
  try {
    const result = await argon2.verify(hash, password);
    return result;
  } catch (error) {
    console.error("Error during password verification:", error);
    throw error;
  }
};

const createPassword = (password: string) => {
  return argon2.hash(password);
};

export { comparePassword, createPassword };
