import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

interface IUserInto {
  name: string;
  email: string;
  password: string;
}

export const resolvers = {
  Query: {
    users: async (parent: any, args: any, context: any) => {
      return await prisma.user.findMany();
    },
  },
  Mutation: {
    signup: async (parent: any, args: IUserInto, context: any) => {
      // Hashed user password
      const hashPassword = await bcrypt.hash(args.password, 12);

      //   Store user info to database
      const newUser = await prisma.user.create({
        data: {
          name: args.name,
          email: args.email,
          password: hashPassword,
        },
      });

      //   Generate a token and return it
      const token = jwt.sign({ id: newUser.id }, "signature", {
        expiresIn: "1d",
      });
      return {
        userError: null,
        token,
      };
    },
    signin: async (parent: any, args: any, context: any) => {
      const user = await prisma.user.findFirst({
        where: {
          email: args.email,
        },
      });
      if (!user) {
        return { userError: "User not found", token: null };
      }
      const passIsCorrect = await bcrypt.compare(args.password, user.password);

      if (!passIsCorrect) {
        return { userError: "Incorrect password!", token: null };
      }

      const token = jwt.sign({ id: user.id }, "signature", {
        expiresIn: "1d",
      });
      return {
        userError: null,
        token,
      };
    },
  },
};
