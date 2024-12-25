import { connectDB } from "@/util/database";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../pages/api/auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const client = await connectDB;
  const db = client.db("StellarLink");

  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // 세션에서 사용자의 이메일 가져오기
  const requesterEmail = session.user?.email;

  switch (req.method) {
    case "GET": {
      try {
        // 내가 보낸 친구 요청 목록 가져오기
        const sentRequests = await db
          .collection("friend_requests")
          .find({ fromUserEmail: requesterEmail, status: "pending" })
          .toArray();

        res.status(200).json(sentRequests);
      } catch (error) {
        res.status(500).json({ message: "Error fetching sent friend requests", error });
      }
      break;
    }

    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).json({ message: `Method ${req.method} not allowed.` });
  }
}
