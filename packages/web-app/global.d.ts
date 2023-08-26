import { User as PrismaUser } from "@prisma/client";
import { DefaultSession, DefaultUser, JWT as NextAuthJWT } from "next-auth";

declare module "next-auth" {
  interface SessionUser extends DefaultUser {
    id: PrismaUser["id"];
    role: PrismaUser["role"];
  }

  interface JWT extends NextAuthJWT {
    id: PrismaUser["id"];
    role: PrismaUser["role"];
  }

  /**
   * @deprecated Don't use, as it might be mistaken for Prisma's User model. Use SessionUser instead.
   */
  interface User extends SessionUser {}

  interface Session extends DefaultSession {
    user: SessionUser;
  }
}
