import { addUrlWithApiKeyHandler } from "@urlshare/web-app/url/api/add-url-with-api-key";
import { StatusCodes } from "http-status-codes";
import { NextApiRequest, NextApiResponse } from "next";
import NextCors from "nextjs-cors";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case "POST":
      await NextCors(req, res, {
        methods: ["POST"],
        origin: "*",
      });

      await addUrlWithApiKeyHandler(req, res);
      break;

    case "OPTIONS":
      res.status(StatusCodes.OK);
      res.end();
      break;

    default:
      res.setHeader("Allow", ["POST", "OPTIONS"]);
      res.status(StatusCodes.METHOD_NOT_ALLOWED).end(`Method ${method} Not Allowed`);
  }
}
