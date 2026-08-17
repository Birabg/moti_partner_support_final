import bcrypt from "bcrypt";

export const BcryptUtils = {
  hash: async (password: string): Promise<string> => {
    return bcrypt.hash(password, 12);
  },

  compare: async (password: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(password, hash);
  },
};
