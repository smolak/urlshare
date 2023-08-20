import { PrismaClient } from "@prisma/client";

let prismaClient: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prismaClient = new PrismaClient({
    errorFormat: "minimal",
  });
} else {
  // @ts-ignore
  globalThis["prisma"] =
    // @ts-ignore
    globalThis["prisma"] ||
    new PrismaClient({
      errorFormat: "pretty",
    });

  // @ts-ignore
  prismaClient = globalThis["prisma"];
}

export const prisma = prismaClient;

export * from "@prisma/client";
