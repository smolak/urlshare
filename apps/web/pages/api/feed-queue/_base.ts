import { processFeedQueueItemHandler } from "@urlshare/web-app/feed-queue/handlers/process-feed-queue-item-handler";
import { StatusCodes } from "http-status-codes";
import { NextApiRequest, NextApiResponse } from "next";

export async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case "POST":
      await processFeedQueueItemHandler(req, res);
      break;

    default:
      res.setHeader("Allow", ["POST"]);
      res.status(StatusCodes.METHOD_NOT_ALLOWED).end(`Method ${method} Not Allowed`);
  }
}
