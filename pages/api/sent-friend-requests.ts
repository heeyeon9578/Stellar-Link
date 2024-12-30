import { connectDB } from "@/util/database";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../pages/api/auth/[...nextauth]";
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const client = await connectDB;
  const db = client.db("StellarLink");

  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // 세션에서 사용자의 이메일 가져오기
  const requesterEmail = session.user?.email;
  const requester = await db.collection("user_cred").findOne({ email: requesterEmail });
  const requesterId = new ObjectId(requester?._id);

  switch (req.method) {
    case "GET": {
      try {
        // 내가 보낸 친구 요청 목록 가져오기 // Request
        const sentRequests = await db
          .collection("friend_requests")
          .find({ fromUserId: requesterId, status: "pending" })
          .toArray();

        // `toUserId`로 `user_cred`에서 상세 정보 가져오기
        const toUserIds = sentRequests.map((req) => new ObjectId(req.toUserId));
        const fromUserIds = sentRequests.map((req) => new ObjectId(req.fromUserId));
        
        const toUserDetails = await db
          .collection("user_cred")
          .find({ _id: { $in: toUserIds } })
          .toArray();

        const fromUserDetails = await db
          .collection("user_cred")
          .find({ _id: { $in: fromUserIds } })
          .toArray();

        // `sentRequests`에 상세 정보를 매핑
        const enrichedRequests = sentRequests.map((request) => {
          const userDetail = toUserDetails.find(
            (user) => user._id.toString() === request.toUserId.toString()
          );

          const senderDetail = fromUserDetails.find(
            (user) => user._id.toString() === request.fromUserId.toString()
          );

          return {
            ...request,
            toUserDetails: userDetail, // 추가된 상세 정보
            fromUserDetails: senderDetail
          };
        });

        res.status(200).json(enrichedRequests);
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
