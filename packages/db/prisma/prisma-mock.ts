import { DeepMockProxy, mockDeep, mockReset } from "vitest-mock-extended";

import { prisma, PrismaClient } from "./client";

vi.mock("./client", () => mockDeep<PrismaClient>());

beforeEach(() => {
  mockReset(prismaMock);
});

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;
