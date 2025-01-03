import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/util/database";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { chatRoomId } = req.query;

    if (!chatRoomId || typeof chatRoomId !== "string") {
      return res.status(400).json({ message: "Invalid chatRoomId" });
    }

    const client = await connectDB;
    const db = client.db("StellarLink");

    // 해당 채팅방의 메시지 가져오기
    const chatRoom = await db.collection("messages").findOne({ chatRoomId });

    if (!chatRoom) {
      return res.status(404).json({ message: "Chat room not found" });
    }

    // 메시지 배열 반환
    res.status(200).json(chatRoom.messages || []);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Error fetching messages" });
  }
}