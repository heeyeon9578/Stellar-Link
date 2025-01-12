import { connectDB } from "@/util/database";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]"; 
import { ObjectId } from "mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = session?.user.id;
    const { chatRoomId, user } = req.body;
    if (!chatRoomId || !userId) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    if (userId.toString() !== user.toString()) {
      return res.status(403).json({ message: "User Different" });
    }

    const client = await connectDB;
    const db = client.db("StellarLink");

    // MongoDB에서 `updateMany`를 호출하여 읽음 상태 업데이트
    await db.collection("messages").updateOne(
      { _id: new ObjectId(chatRoomId) }, // 채팅방 ID 조건
      {
        $addToSet: {
          "messages.$[elem].readBy": new ObjectId(user), // 읽음 처리
        },
      },
      {
        arrayFilters: [
          { "elem.readBy": { $ne: new ObjectId(user) } }, // 아직 읽지 않은 메시지
        ],
      }
    );

    res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    console.error("Error mark-as-read chat room:", error);
    res.status(500).json({ message: "Error mark-as-read chat room" });
  }
}
