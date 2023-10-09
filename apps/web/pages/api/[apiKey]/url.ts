import { addUrlWithApiKeyHandler } from "@urlshare/web-app/url/api/add-url-with-api-key";
import { StatusCodes } from "http-status-codes";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case "POST":
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET,DELETE,PATCH,POST,PUT");
      res.setHeader(
        "Access-Control-Allow-Headers",
        "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
      );

      await addUrlWithApiKeyHandler(req, res);
      break;

    case "OPTIONS":
      res.status(StatusCodes.OK);
      break;

    default:
      res.setHeader("Allow", ["POST", "OPTIONS"]);
      res.status(StatusCodes.METHOD_NOT_ALLOWED).end(`Method ${method} Not Allowed`);
  }
}
