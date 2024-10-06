import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwtHealper";

const prisma = new PrismaClient();

interface IUserInto {
  name: string;
  email: string;
  password: string;
  bio?: string;
}

export const resolvers = {
  Query: {
    users: async (parent: any, args: any, context: any) => {
      return await prisma.user.findMany();
    },
  },
  Mutation: {
    signup: async (parent: any, args: IUserInto, context: any) => {
      const user = await prisma.user.findFirst({
        where: {
          email: args.email,
        },
      });

      if (user) {
        return {
          userError: "User already exists",
          token: null,
        };
      }

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

      if (args?.bio) {
        await prisma.profile.create({
          data: {
            userId: newUser.id,
            bio: args.bio,
          },
        });
      }

      //   Generate a token and return it
      const token = generateToken({ id: newUser.id });
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

      const token = generateToken({ id: user.id });
      return {
        userError: null,
        token,
      };
    },
  },
};
