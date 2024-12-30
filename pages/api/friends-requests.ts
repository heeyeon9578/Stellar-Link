import { connectDB } from '@/util/database';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../pages/api/auth/[...nextauth]';
import { ObjectId } from 'mongodb';
/**
 * 친구 요청 목록 가져오기 및 친구 요청 수락 또는 거절하기
 * @param req 
 * @param res 
 * @returns 
 */
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
  const requesterId = new ObjectId(requester?._id);
  if (!requester) {
    return res.status(404).json({ message: "Requester not found" });
  }

  // 항상 ObjectId로 변환해서 사용
  const userId = new ObjectId(requester._id);

  switch (req.method) {
    case "GET": {
      try {
       // 내가 보낸 친구 요청 목록 가져오기 // Request
       const sentRequests = await db
       .collection("friend_requests")
       .find({ toUserId: userId, status: "pending" })
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
        res.status(500).json({ message: "Error fetching friend requests", error });
      }
      break;
    }

    //친구요청 수락 또는 거절하기
    case "PATCH": {
        try {
          const { fromUserId, action } = req.body;
      
          // 요청 유효성 검증
          if (!fromUserId || !["accepted", "rejected"].includes(action)) {
            return res.status(400).json({ message: "Invalid request or action" });
          }
      

          // 친구 요청 확인
          const request = await db.collection("friend_requests").findOne({
            fromUserId: new ObjectId(fromUserId),
            toUserId: requesterId,
            status: "pending",
          });
      
          if (!request) {
            return res.status(404).json({ message: "Friend request not found." });
          }
      
          // 상태 업데이트
          await db.collection("friend_requests").updateOne(
            { fromUserId: new ObjectId(fromUserId), toUserId: requesterId, status: "pending" },
            { $set: { status: action } }
          );
      
          if (action === "accepted") {
            await db.collection("friends").updateOne(
              { userId },
              {
                $push: {
                  friends: {
                    friendId: new ObjectId(request.fromUserId) ,
                    // name: request.fromUserName,
                    // email: request.fromUserEmail,
                    // profileImage: request.fromUserProfileImage,
                    addedAt: new Date(),
                    status: "active",
                  },
                },
              },
              { upsert: true }
            );
          
            await db.collection("friends").updateOne(
              { userId:  new ObjectId(request.fromUserId) },
              {
                $push: {
                  friends: {
                    friendId: requesterId,
                    // name: requester.name,
                    // email: requesterEmail,
                    // profileImage: requester.profileImage || "/SVG/default-profile.svg",
                    addedAt: new Date(),
                    status: "active",
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
