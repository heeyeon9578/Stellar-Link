import { connectDB } from "@/util/database";
import { NextApiRequest, NextApiResponse } from "next";
import { ObjectId } from "mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: `Method ${req.method} not allowed.` });
  }

  try {
    const { chatRoomId } = req.query;

    if (!chatRoomId || typeof chatRoomId !== "string") {
      return res.status(400).json({ message: "Invalid request data." });
    }

    const client = await connectDB;
    const db = client.db("StellarLink");

    // 메시지 조회
    const messages = await db
      .collection("messages")
      .find({ chatRoomId: new ObjectId(chatRoomId) })
      .sort({ timestamp: 1 }) // 메시지를 시간순으로 정렬
      .toArray();

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Error fetching messages" });
  }
}