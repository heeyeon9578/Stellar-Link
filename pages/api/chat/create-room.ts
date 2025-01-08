import { connectDB } from "@/util/database";
import { NextApiRequest, NextApiResponse } from "next";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]"; // 인증 옵션 경로 조정
/**
 * 채팅방 만들기
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
    console.error('들어오긴함')
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const client = await connectDB;
    const db = client.db("StellarLink");

    // 현재 사용자 ID 가져오기
    const currentUser = await db.collection("user_cred").findOne({ email: session.user?.email });
    if (!currentUser) {
      return res.status(404).json({ message: "Current user not found." });
    }

    const { participants, type, title  } = req.body;

    if (!participants || !type) {
      return res.status(400).json({ message: "Invalid request data." });
    }
    console.log(`
        
        
        
        
        
        participants, type
        
        
        
        
        
        
        
        `,participants, type)
    // 현재 사용자의 ID를 participants에 추가
    const allParticipants = [new ObjectId(currentUser._id), ...participants.map((id: string) => new ObjectId(id))];
    
    // 참여자 기준으로 기존 채팅방 검색
    const existingRoom = await db.collection("messages").findOne({
      type,
      participants: { $all: allParticipants, $size: allParticipants.length },
    });

    if (existingRoom) {
      // 기존 채팅방이 있으면 해당 ID 반환
      return res.status(200).json({ chatRoomId: existingRoom._id });
    }

    // 채팅 방 생성
    const newRoom = await db.collection("messages").insertOne({
      participants: allParticipants,
      type,
      title: title || null, // title이 없으면 null로 저장
      createdAt: new Date(),
      messages: []
    });

    res.status(200).json({ chatRoomId: newRoom.insertedId });
  } catch (error) {
    console.error("Error creating chat room:", error);
    res.status(500).json({ message: "Error creating chat room" });
  }
}