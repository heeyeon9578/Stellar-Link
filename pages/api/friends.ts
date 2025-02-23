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
  const requester = await db.collection("user_cred").findOne({ email: requesterEmail });
  const requesterId = new ObjectId(requester?._id) ;
  switch (req.method) {
    case "GET": {
      try {
        // 요청자의 이메일로 사용자 ID 가져오기
        

        if (!requester) {
          return res.status(404).json({ message: "Requester not found." });
        }
       
       
        // Extract sort parameters from the query and ensure they are strings
        const sortBy = Array.isArray(req.query.sortBy) ? req.query.sortBy[0] : req.query.sortBy || "addedAt";
        const order = Array.isArray(req.query.order) ? req.query.order[0] : req.query.order || "desc";
        
        // Validate sortBy and order
        const validSortBy = ["addedAt", "name"];
        const validOrder = ["asc", "desc"];
        if (!validSortBy.includes(sortBy) || !validOrder.includes(order)) {
          return res.status(400).json({ message: "Invalid sorting parameters." });
        }
        const friendship = await db.collection("friends").findOne({ userId: requesterId });
        
        if (!friendship || !friendship.friends) {
          return res.status(200).json([]);
        }

        const friendDetails = await Promise.all(
          friendship.friends.map(async (friend: any) => {
            const userDetail = await db.collection('user_cred').findOne({ _id: new ObjectId(friend.friendId) });
        
            // 친구의 상세 정보와 status, addedAt 조합
            return {
              ...userDetail,
              status: friend.status,
              addedAt: friend.addedAt,
            };
          })
        );
        //return res.status(200).json(friendDetails);
       
         // Sort the data using JavaScript (for simplicity)
         const sortedFriends = friendDetails.sort((a, b) => {
          if (sortBy === "addedAt") {
            const dateA = new Date(a.addedAt || 0).getTime();
            const dateB = new Date(b.addedAt || 0).getTime();
            return order === "asc" ? dateA - dateB : dateB - dateA;
          } else if (sortBy === "name") {
            return order === "asc"
              ? (a.name || "").localeCompare(b.name || "")
              : (b.name || "").localeCompare(a.name || "");
          }
          return 0;
        });

        return res.status(200).json(sortedFriends);

      } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error fetching friends", error });
      }
      break;
    }
    //친구 요청하기
    case "POST": {
        try {
          const { email: friendEmail } = req.body;
  
          if (!friendEmail) {
            return res.status(400).json({ message: "Friend's email is required." });
          }
  
         
  
          // Normalize friendEmail
          const normalizedFriendEmail = friendEmail.trim().toLowerCase();
         
          const allUsers = await db.collection("user_cred").find().toArray();
        
          
  
          if (!requester) {
          
            return res.status(404).json({ message: "Requester information not found." });
          }
  
          // 친구 이메일로 사용자 검색
          const friend = await db.collection("user_cred").findOne({ email: normalizedFriendEmail });
  
          if (!friend) {
           
            return res.status(404).json({ message: "User with this email does not exist." });
          }
  
      
  
          // 중복 요청 방지
          const existingRequest = await db.collection("friend_requests").findOne({
            fromUserId: new ObjectId(requester._id),
            toUserId: new ObjectId(friend._id),
            status: "pending",
          });

          console.log(`
            
           
            
            `,existingRequest);
          
          if (existingRequest) {
            return res.status(400).json({ message: "Friend request already sent." });
          }
          
          // 중복 요청 방지 - friends 컬렉션에서 이미 존재할 경우
          const existingFriend = await db.collection("friends").findOne({
            userId: requesterId,
            "friends.friendId": new ObjectId(friend._id),
          });
        
          if (existingFriend) {
            return res.status(400).json({ message: "User is already your friend." });
          }

          // 친구 요청 추가
          await db.collection("friend_requests").insertOne({
            fromUserId: new ObjectId(requester._id),
            // fromUserEmail: requester.email,
            // fromUserName: requester.name,
            // fromUserProfileImage: requester.profileImage || "/SVG/default-profile.svg",
            toUserId:new ObjectId(friend._id) ,
            // toUserEmail: friend.email,
            // toUserName: friend.name,
            // toUserProfileImage: friend.profileImage || "/SVG/default-profile.svg",
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
      const {toUserId , action } = req.body;
      // email: 상대방 이메일, action: "cancel"

      if (!toUserId || !action ) {
        return res.status(400).json({ message: "Invalid request data." });
      }

     
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
            fromUserId: requesterId,
            toUserId: new ObjectId(toUserId),
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
            { userId: requesterId, "friends.friendId": new ObjectId(toUserId) },
            { $set: { "friends.$.status": "block" } }
          );

          // 만약 해당 친구가 friends 배열에 없을 수도 있으니, 추가 로직을 통해
          // 아예 친구 목록이 없거나, entry가 없다면 새로 push 할 수도 있습니다.
          // (유저마다 구현이 다를 수 있으므로, 필요하다면 아래와 같은 로직 추가)
          // if (blockResult.matchedCount === 0) {
          //   // 만약 friends 배열에 이 사용자가 없다면 새로 추가
          //   await db.collection("friends").updateOne(
          //     { userId: requester._id },
          //     {
          //       $push: {
          //         friends: {
          //           toUserId,
          //           status: "block",
          //         },
          //       },
          //     },
          //     { upsert: true }
          //   );
          // }

          return res.status(200).json({ message: "Friend blocked successfully." });
        }

        /**
         * 3-3) 친구 차단 해제하기
         */
        case "unblock": {
          // friends 컬렉션에서 해당 친구의 status 가 "block" 이라면 "accepted" 혹은 다른 상태로 되돌린다.
          // (어떤 상태로 되돌릴지는 앱 로직에 따라 다릅니다. 여기서는 단순히 "accepted" 라고 가정)
          const unblockResult = await db.collection("friends").updateOne(
            { userId: requesterId, "friends.friendId": new ObjectId(toUserId) },
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
        const { friendId } = req.body;

        if (!friendId) {
          return res.status(400).json({ message: "Friend's email to delete is required." });
        }

        if (!requester) {
          return res.status(404).json({ message: "Requester information not found." });
        }

        // 친구 삭제
        await db.collection("friends").updateOne(
          { userId: requesterId },
          { $pull: { friends: { friendId: new ObjectId(friendId) } } }
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
