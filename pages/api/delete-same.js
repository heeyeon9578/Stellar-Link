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
export default async function handler(req, res) {
  const client = await connectDB;
  const db = client.db("StellarLink");

  const friendsCollection = db.collection("friends");

  try {

    // 모든 문서 가져오기
    const allUsers = await friendsCollection.find().toArray();

    for (const user of allUsers) {
      const userId = user.userId;

      // 중복 제거를 위해 `friendId` 기준으로 고유한 친구들만 남기기
      const uniqueFriends = Array.from(
        new Map(user.friends.map((friend) => [friend.friendId.toString(), friend]))
      ).values();

      // 중복이 있을 경우에만 업데이트
      if (uniqueFriends.length !== user.friends.length) {
        console.log(`Removing duplicates for userId: ${userId}`);
        await friendsCollection.updateOne(
          { _id: user._id },
          { $set: { friends: Array.from(uniqueFriends) } }
        );
      }
    }

    console.log("Duplicate friends removed successfully.");
  } catch (error) {
    console.error("Error removing duplicate friends:", error);
  } finally {
    await client.close();
  }

    console.log("Duplicate friends removed successfully.");
  
}
