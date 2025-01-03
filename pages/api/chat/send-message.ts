import { connectDB } from "@/util/database";
import { NextApiRequest, NextApiResponse } from "next";
import { ObjectId } from "mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: `Method ${req.method} not allowed.` });
  }

  try {
    const { chatRoomId, sender, text } = req.body;

    if (!chatRoomId || !sender || !text) {
      return res.status(400).json({ message: "Invalid request data." });
    }

    const client = await connectDB;
    const db = client.db("StellarLink");

    // 메시지 저장
    await db.collection("messages").insertOne({
      chatRoomId: new ObjectId(chatRoomId),
      sender: new ObjectId(sender),
      text,
      timestamp: new Date(),
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Error sending message" });
  }
}