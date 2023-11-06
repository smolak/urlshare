import { DefaultArgs } from "@prisma/client/runtime/library";

import { Prisma, PrismaClient } from "./client";

export type TransactionPrismaClient = Omit<
  PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;
