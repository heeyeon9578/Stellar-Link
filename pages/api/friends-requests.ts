import { connectDB } from '@/util/database';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../pages/api/auth/[...nextauth]';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const client = await connectDB;
  const db = client.db("StellarLink");

  // 인증된 사용자 가져오기
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const requesterEmail = session.user?.email;

  // 사용자 정보 가져오기
  const requester = await db.collection("user_cred").findOne({ email: requesterEmail });

  if (!requester) {
    return res.status(404).json({ message: "Requester not found" });
  }

  const userId = requester._id;

  switch (req.method) {
    case "GET": {
      try {
        // 친구 요청 목록 가져오기
        const incomingRequests = await db
          .collection("friend_requests")
          .find({ toUserId: userId.toString(), status: "pending" })
          .toArray();

        res.status(200).json(incomingRequests);
      } catch (error) {
        res.status(500).json({ message: "Error fetching friend requests", error });
      }
      break;
    }

    case "PATCH": {
        try {
          const { fromUserEmail, action } = req.body;
      
          // 요청 유효성 검증
          if (!fromUserEmail || !["accepted", "rejected"].includes(action)) {
            return res.status(400).json({ message: "Invalid request or action" });
          }
      
          console.log("Action:", action, "From User Email:", fromUserEmail, "toUserEmail:",requesterEmail);
      
          // 친구 요청 확인
          const request = await db.collection("friend_requests").findOne({
            fromUserEmail,
            toUserEmail: requesterEmail,
            status: "pending",
          });
      
          if (!request) {
            return res.status(404).json({ message: "Friend request not found." });
          }
      
          // 상태 업데이트
          await db.collection("friend_requests").updateOne(
            { fromUserEmail, toUserEmail: requesterEmail, status: "pending" },
            { $set: { status: action } }
          );
      
          if (action === "accepted") {
            await db.collection("friends").updateOne(
              { userId },
              {
                $push: {
                  friends: {
                    friendId: request.fromUserId,
                    name: request.fromUserName,
                    email: request.fromUserEmail,
                    profileImage: request.fromUserProfileImage,
                    addedAt: new Date(),
                  },
                },
              },
              { upsert: true }
            );
          
            await db.collection("friends").updateOne(
              { userId: request.fromUserId },
              {
                $push: {
                  friends: {
                    friendId: userId,
                    name: requester.name,
                    email: requesterEmail,
                    profileImage: requester.profileImage || "/default-profile.png",
                    addedAt: new Date(),
                  },
                },
              },
              { upsert: true }
            );
          }
          
          res.status(200).json({ message: `Friend request ${action} successfully.` });
        } catch (error) {
          console.error("Error in PATCH /api/friends-requests:", error);
          res.status(500).json({ message: "Error processing friend request.", error });
        }
        break;
      }
      

    default:
      res.setHeader("Allow", ["GET", "PATCH"]);
      res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
}
