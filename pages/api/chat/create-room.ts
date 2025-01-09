import { connectDB } from "@/util/database";
import { NextApiRequest, NextApiResponse } from "next";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]"; // 인증 옵션 경로 조정

/**
 * 채팅방 만들기 또는 참가자 추가
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

    const { chatRoomId, participants, type, title } = req.body;

    if (!participants || !type) {
      return res.status(400).json({ message: "Invalid request data." });
    }

    const currentUserId = new ObjectId(currentUser._id);

    if (chatRoomId) {
      // 기존 채팅방에 참가자 추가
      const existingRoom = await db.collection("messages").findOne({ _id: new ObjectId(chatRoomId) });

      if (!existingRoom) {
        return res.status(404).json({ message: "Chat room not found." });
      }

      const newParticipants = participants.map((id: string) => new ObjectId(id));
      const updatedParticipants = [
        ...new Set([...(existingRoom.participants || []), ...newParticipants, currentUserId]),
      ];

      await db.collection("messages").updateOne(
        { _id: new ObjectId(chatRoomId) },
        { $set: { participants: updatedParticipants } }
      );

      return res.status(200).json({ chatRoomId });
    } else {
      // 새 채팅방 생성
      const allParticipants = [
        currentUserId,
        ...participants.map((id: string) => new ObjectId(id)),
      ];

      const existingRoom = await db.collection("messages").findOne({
        type,
        participants: { $all: allParticipants, $size: allParticipants.length },
      });

      if (existingRoom) {
        return res.status(200).json({ chatRoomId: existingRoom._id });
      }

      const newRoom = await db.collection("messages").insertOne({
        participants: allParticipants,
        type,
        title: title || null,
        createdAt: new Date(),
        messages: [],
      });

      return res.status(200).json({ chatRoomId: newRoom.insertedId });
    }
  } catch (error) {
    console.error("Error handling chat room API:", error);
    res.status(500).json({ message: "Error handling chat room API" });
  }
}