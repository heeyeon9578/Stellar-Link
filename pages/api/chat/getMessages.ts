import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/util/database";
import { ObjectId } from "mongodb";
/**
 * 채팅창 메시지 가져오기
 * @param req 
 * @param res 
 * @returns 
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { chatRoomId } = req.query;

    if (!chatRoomId || typeof chatRoomId !== "string") {
      return res.status(400).json({ message: "Invalid chatRoomId" });
    }

    const client = await connectDB;
    const db = client.db("StellarLink");

    // 채팅방에서 메시지 가져오기
    const chatRoom = await db.collection("messages").findOne({ _id: new ObjectId(chatRoomId) });
    console.log(`


      chatRoom
      

      `, chatRoom)

    if (!chatRoom) {
      return res.status(404).json({ message: "Chat room not found" });
    }

    const messages = chatRoom.messages || [];

    if (messages.length === 0) {
      return res.status(200).json([]);
    }

    // 모든 사용자 ID 추출
    const userIds = messages.map((msg: any) => new ObjectId(msg.requesterId));

    // 사용자 정보 조회
    const users = await db
      .collection("user_cred")
      .find({ _id: { $in: userIds } })
      .toArray();

    // 사용자 ID를 기준으로 매핑
    const userMap = users.reduce((acc: any, user: any) => {
      acc[user._id.toString()] = {
        name: user.name || "Unknown User",
        email: user.email || "Unknown Email",
        profileImage: user.profileImage || "/SVG/default-profile.svg",
      };
      return acc;
    }, {});

    // 메시지에 사용자 정보 매핑
    const enrichedMessages = messages.map((msg: any) => ({
      ...msg,
      requesterName: userMap[msg.requesterId]?.name || "Unknown User",
      requesterEmail: userMap[msg.requesterId]?.email || "Unknown Email",
      requesterImage: userMap[msg.requesterId]?.profileImage || "/SVG/default-profile.svg",
    }));

    // 결과 반환
    res.status(200).json(enrichedMessages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Error fetching messages" });
  }
}