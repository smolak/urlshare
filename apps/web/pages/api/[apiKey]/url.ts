import { addUrlWithApiKeyHandler } from "@urlshare/web-app/url/api/add-url-with-api-key";
import { StatusCodes } from "http-status-codes";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case "POST":
      await addUrlWithApiKeyHandler(req, res);
      break;

    default:
      res.setHeader("Allow", ["POST"]);
      res.status(StatusCodes.METHOD_NOT_ALLOWED).end(`Method ${method} Not Allowed`);
  }
}
