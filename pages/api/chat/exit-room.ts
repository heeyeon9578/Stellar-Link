import { connectDB } from "@/util/database";
import { NextApiRequest, NextApiResponse } from "next";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]"; // 인증 옵션 경로 조정
/**
 * 채팅방 나가기
 * @param req 
 * @param res 
 * @returns 
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: `Method ${req.method} not allowed.` });
  }

  try {

    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userId = session?.user.id;
    const client = await connectDB;
    const db = client.db("StellarLink");
    const collection = db.collection("messages");

  
    const { user, chatRoomId } = req.body;

    if (!user || !chatRoomId) {
      return res.status(400).json({ message: "Invalid request data." });
    }

   
    if(userId.toString() !== user.toString()){
        return res.status(403).json({ message: "User Different" });
    }

    // 채팅방에서 participants 배열에서 사용자 제거
    const result = await collection.updateOne(
      { _id: new ObjectId(chatRoomId) }, // 대상 채팅방
      { $pull: { participants: new ObjectId(user) } } // participants 배열에서 사용자 제거
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Chat room or user not found." });
    }

    res.status(200).json({ message: "User successfully removed from chat room." });

  } catch (error) {
    console.error("Error Exit chat room:", error);
    res.status(500).json({ message: "Error Exit chat room" });
  }
}