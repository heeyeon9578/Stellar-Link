import { connectDB } from "@/util/database";
import { NextApiRequest, NextApiResponse } from "next";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]"; // 인증 옵션 경로 조정

/**
 * 채팅방 이름 수정 API
 * @param req 
 * @param res 
 * @returns 
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PATCH") {
    res.setHeader("Allow", ["PATCH"]);
    return res.status(405).json({ message: `Method ${req.method} not allowed.` });
  }

  try {
    console.error('API 호출됨');
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const client = await connectDB;
    const db = client.db("StellarLink");

    const currentUser = await db.collection("user_cred").findOne({ email: session.user?.email });
    if (!currentUser) {
      return res.status(404).json({ message: "Current user not found." });
    }

    const { chatRoomId, title } = req.body;

    if (!chatRoomId || !title) {
      return res.status(400).json({ message: "Invalid request data." });
    }

    const chatRoomObjectId = new ObjectId(chatRoomId);

    // 채팅방 존재 여부 확인
    const existingRoom = await db.collection("messages").findOne({ _id: chatRoomObjectId });
    if (!existingRoom) {
      return res.status(404).json({ message: "Chat room not found." });
    }

    // 채팅방 제목 업데이트
    await db.collection("messages").updateOne(
      { _id: chatRoomObjectId },
      { $set: { title } }
    );

    return res.status(200).json({ message: "Chat room title updated successfully." });
  } catch (error) {
    console.error("Error handling chat room title update API:", error);
    res.status(500).json({ message: "Error handling chat room title update API" });
  }
}
