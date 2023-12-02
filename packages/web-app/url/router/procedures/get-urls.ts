import { CompressedMetadata, decompressMetadata } from "@urlshare/metadata/compression";

import { protectedProcedure } from "../../../trpc/server";

// TODO: Check if this one is used, probably not.
export const getUrls = protectedProcedure.query(async ({ ctx: { prisma } }) => {
  const userUrls = await prisma.userUrl.findMany({
    include: {
      url: true,
      userProfileData: {
        select: {
          id: true,
          image: true,
          username: true,
          createdAt: true,
        },
      },
    },
  });

  const urlList = userUrls.map(({ url, userProfileData, ...userUrl }) => {
    return {
      userProfileData,
      userUrl,
      url: {
        ...url,
        metadata: decompressMetadata(url.metadata as CompressedMetadata),
      },
    };
  });

  return urlList;
});
