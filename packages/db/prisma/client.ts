import { PrismaClient } from "@prisma/client";

import { generateModelId } from "./middlewares/generate-model-id";

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

// TODO: Need to replace the deprecated $use with client's extension.
// See: https://www.prisma.io/docs/concepts/components/prisma-client/client-extensions
prismaClient.$use(generateModelId);

export const prisma = prismaClient;

export * from "@prisma/client";
