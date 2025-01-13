import { connectDB } from "@/util/database";
import { NextApiRequest, NextApiResponse } from "next";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]"; // 인증 옵션 경로 조정

/**
 * 채팅방 참여자의 색상 정보 가져오기
 * @param req
 * @param res
 * @returns
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: `Method ${req.method} not allowed.` });
  }

  try {
    const { chatRoomId } = req.query;
    // 사용자 세션 확인
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!chatRoomId) {
      return res.status(400).json({ message: "Missing required fields: chatRoomId." });
    }

    const client = await connectDB;
    const db = client.db("StellarLink");

    const participants = await db.collection("participants").findOne({
      _id: new ObjectId(chatRoomId.toString()),
    });

    if (!participants) {
      return res.status(404).json({ message: "Participants not found." });
    }

    res.status(200).json({ participants: participants.participants });
  } catch (error) {
    console.error("Error fetching participants colors:", error);
    res.status(500).json({ message: "Error fetching participants colors." });
  }
}
