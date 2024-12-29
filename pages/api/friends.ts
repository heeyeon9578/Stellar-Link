import { connectDB } from "@/util/database";
import { NextApiRequest, NextApiResponse } from "next";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../../pages/api/auth/[...nextauth]";
/**
 * 친구 목록 가져오기 / 친구 요청하기 / 친구 요청 취소하기 / 친구 삭제하기 / 친구 차단하기
 * @param req 
 * @param res 
 * @returns 
 */
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
    //친구요청하기
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
            fromUserProfileImage: requester.profileImage || "/SVG/default-profile.svg",
            toUserId: friend._id.toString(),
            toUserEmail: friend.email,
            toUserName: friend.name,
            toUserProfileImage: friend.profileImage || "/SVG/default-profile.svg",
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
   //보낸 친구 요청 취소 / 친구 차단하기 / 친구 차단 해제하기
   case "PATCH": {
    try {
      const { email, action } = req.body;
      // email: 상대방 이메일, action: "cancel"

      if (!email || !action ) {
        return res.status(400).json({ message: "Invalid request data." });
      }

      // user_cred에서 현재 사용자(요청자) 정보 가져오기
      const requester = await db.collection("user_cred").findOne({ email: requesterEmail });
      if (!requester) {
        return res.status(404).json({ message: "Requester not found." });
      }

      switch (action) {
        /**
         * 3-1) 보낸 친구 요청 취소
         */
        case "cancel": {
          // friend_requests에서 'pending' 상태인 요청을 삭제
          const deleteResult = await db.collection("friend_requests").deleteOne({
            fromUserEmail: requesterEmail,
            toUserEmail: email,
            status: "pending",
          });

          if (deleteResult.deletedCount === 0) {
            return res.status(404).json({ message: "No pending friend request to cancel." });
          }

          return res.status(200).json({ message: "Friend request canceled successfully." });
        }

        /**
         * 3-2) 친구 차단하기
         */
        case "block": {
          // friends 컬렉션에서 해당 친구의 status 를 "block" 으로 설정
          const blockResult = await db.collection("friends").updateOne(
            { userId: requester._id, "friends.email": email },
            { $set: { "friends.$.status": "block" } }
          );

          // 만약 해당 친구가 friends 배열에 없을 수도 있으니, 추가 로직을 통해
          // 아예 친구 목록이 없거나, entry가 없다면 새로 push 할 수도 있습니다.
          // (유저마다 구현이 다를 수 있으므로, 필요하다면 아래와 같은 로직 추가)
          if (blockResult.matchedCount === 0) {
            // 만약 friends 배열에 이 사용자가 없다면 새로 추가
            await db.collection("friends").updateOne(
              { userId: requester._id },
              {
                $push: {
                  friends: {
                    email,
                    status: "block",
                  },
                },
              },
              { upsert: true }
            );
          }

          return res.status(200).json({ message: "Friend blocked successfully." });
        }

        /**
         * 3-3) 친구 차단 해제하기
         */
        case "unblock": {
          // friends 컬렉션에서 해당 친구의 status 가 "block" 이라면 "accepted" 혹은 다른 상태로 되돌린다.
          // (어떤 상태로 되돌릴지는 앱 로직에 따라 다릅니다. 여기서는 단순히 "accepted" 라고 가정)
          const unblockResult = await db.collection("friends").updateOne(
            { userId: requester._id, "friends.email": email },
            { $set: { "friends.$.status": "active" } }
          );

          if (unblockResult.matchedCount === 0) {
            return res
              .status(404)
              .json({ message: "No blocked friend found to unblock or friend not in list." });
          }

          return res.status(200).json({ message: "Friend unblocked successfully." });
        }

        default:
          return res.status(400).json({ message: "Unknown action." });
      }
    } catch (error) {
      console.error("Error in PATCH /api/friends (cancel request):", error);
      return res.status(500).json({ message: "Error canceling friend request", error });
    }
  }
      //친구 삭제 하기
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
      res.setHeader("Allow", ["GET", "POST", "DELETE","PATCH"]);
      res.status(405).json({ message: `Method ${req.method} not allowed.` });
  }
}
