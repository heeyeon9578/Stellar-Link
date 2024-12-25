import { connectDB } from "@/util/database";
import { NextApiRequest, NextApiResponse } from "next";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../../pages/api/auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const client = await connectDB;
  const db = client.db("StellarLink");

  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // 세션에 있는 사용자 이메일
  const requesterEmail = session.user?.email;

  switch (req.method) {
    case "GET": {
      try {
        // 요청자의 이메일로 사용자 ID 가져오기
        const requester = await db.collection("user_cred").findOne({ email: requesterEmail });

        if (!requester) {
          return res.status(404).json({ message: "Requester not found." });
        }

        const friends = await db.collection("friends").findOne({ userId: requester._id });
        res.status(200).json(friends ? friends.friends : []);
      } catch (error) {
        res.status(500).json({ message: "Error fetching friends", error });
      }
      break;
    }

    case "POST": {
        try {
          const { email: friendEmail } = req.body;
  
          if (!friendEmail) {
            return res.status(400).json({ message: "Friend's email is required." });
          }
  
          console.log("Raw friendEmail:", friendEmail);
  
          // Normalize friendEmail
          const normalizedFriendEmail = friendEmail.trim().toLowerCase();
          console.log("Normalized friendEmail:", normalizedFriendEmail);
          const allUsers = await db.collection("user_cred").find().toArray();
          console.log("All Users in Database:", allUsers);
          // 요청자의 정보 가져오기
          const requester = await db.collection("user_cred").findOne({ email: requesterEmail });
  
          if (!requester) {
            console.log("Requester not found with email:", requesterEmail);
            return res.status(404).json({ message: "Requester information not found." });
          }
  
          // 친구 이메일로 사용자 검색
          const friend = await db.collection("user_cred").findOne({ email: normalizedFriendEmail });
  
          if (!friend) {
            console.log("Friend not found with email:", normalizedFriendEmail);
            return res.status(404).json({ message: "User with this email does not exist." });
          }
  
          console.log("Friend found:", friend);
  
          // 중복 요청 방지
          const existingRequest = await db.collection("friend_requests").findOne({
            fromUserEmail: requester.email,
            toUserEmail: friend.email,
            status: "pending",
          });
  
          if (existingRequest) {
            return res.status(400).json({ message: "Friend request already sent." });
          }
  
          // 친구 요청 추가
          await db.collection("friend_requests").insertOne({
            fromUserId: requester._id.toString(),
            fromUserEmail: requester.email,
            fromUserName: requester.name,
            fromUserProfileImage: requester.profileImage || "/default-profile.png",
            toUserId: friend._id.toString(),
            toUserEmail: friend.email,
            toUserName: friend.name,
            toUserProfileImage: friend.profileImage || "/default-profile.png",
            status: "pending",
            requestedAt: new Date(),
          });
  
          res.status(200).json({ message: "Friend request sent successfully." });
        } catch (error) {
          console.error("Error in POST /api/friends:", error);
          res.status(500).json({ message: "Error sending friend request", error });
        }
        break;
      }
  

    case "DELETE": {
      try {
        const { email: friendEmail } = req.body;

        if (!friendEmail) {
          return res.status(400).json({ message: "Friend's email to delete is required." });
        }

        // 요청자의 정보 가져오기
        const requester = await db.collection("user_cred").findOne({ email: requesterEmail });

        if (!requester) {
          return res.status(404).json({ message: "Requester information not found." });
        }

        // 친구 삭제
        await db.collection("friends").updateOne(
          { userId: requester._id },
          { $pull: { friends: { email: friendEmail } } }
        );

        res.status(200).json({ message: "Friend removed successfully." });
      } catch (error) {
        res.status(500).json({ message: "Error removing friend", error });
      }
      break;
    }

    default:
      res.setHeader("Allow", ["GET", "POST", "DELETE"]);
      res.status(405).json({ message: `Method ${req.method} not allowed.` });
  }
}
