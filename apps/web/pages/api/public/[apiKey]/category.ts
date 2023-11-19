import { addCategoryWithApiKeyHandler } from "@urlshare/web-app/category/api/add-category-with-api-key";
import { getCategoriesWithApiKeyHandler } from "@urlshare/web-app/category/api/get-categories-with-api-key";
import { StatusCodes } from "http-status-codes";
import { NextApiRequest, NextApiResponse } from "next";
import NextCors from "nextjs-cors";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case "GET":
      await NextCors(req, res, {
        methods: ["GET"],
        origin: "*",
      });

      await getCategoriesWithApiKeyHandler(req, res);
      break;

    case "POST":
      await addCategoryWithApiKeyHandler(req, res);
      break;

    case "OPTIONS":
      res.status(StatusCodes.OK);
      res.end();
      break;

    default:
      res.setHeader("Allow", ["GET", "POST", "OPTIONS"]);
      res.status(StatusCodes.METHOD_NOT_ALLOWED).end(`Method ${method} Not Allowed`);
  }
}
