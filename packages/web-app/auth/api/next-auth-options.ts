import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { User } from "@prisma/client";
import { prisma } from "@urlshare/db/prisma/client";
import { GetServerSidePropsContext } from "next";
import { type NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth/next";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

export const nextAuthOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async jwt({ token }) {
      const { role } = await prisma.user.findFirstOrThrow({
        where: {
          id: token.sub,
        },
        select: {
          role: true,
        },
      });

      token.role = role;
      token.id = token.sub;

      return token;
    },
    session({ session, token }) {
      if (token) {
        session.user.role = token.role as User["role"];
        session.user.id = token.id as User["id"];
      }

      return session;
    },
    signIn({ account, profile }) {
      if (account?.provider === "google") {
        // @ts-ignore
        return profile?.email_verified && profile?.email?.endsWith("@gmail.com");
      }

      return true; // Do different verification for other providers that don't have `email_verified`
    },
  },
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
};

export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, nextAuthOptions);
};
