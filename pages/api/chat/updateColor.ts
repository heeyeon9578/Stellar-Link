import { connectDB } from "@/util/database";
import { NextApiRequest, NextApiResponse } from "next";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]"; // 인증 옵션 경로 조정

/**
 * 말풍선 색상 업데이트하기 (없으면 추가)
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
    // 사용자 세션 확인
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { userId, chatRoomId, color } = req.body;

    // 요청 데이터 검증
    if (!userId || !chatRoomId || !color) {
      return res.status(400).json({ message: "Missing required fields: userId, chatRoomId, color." });
    }

    // 세션 사용자와 요청 사용자 ID 확인
    if (session?.user.id.toString() !== userId.toString()) {
      return res.status(400).json({ message: "Not the same user." });
    }

    const client = await connectDB;
    const db = client.db("StellarLink");

    // 문서가 없으면 생성
    const result = await db.collection("participants").updateOne(
      { _id: new ObjectId(chatRoomId) },
      {
        $setOnInsert: { _id: new ObjectId(chatRoomId), participants: [] }, // 문서 생성 시 빈 participants 배열 추가
      },
      { upsert: true } // 없으면 생성
    );

    // participants 배열에서 userId가 존재하는지 확인
    const existingParticipant = await db.collection("participants").findOne({
      _id: new ObjectId(chatRoomId),
      "participants.userId": new ObjectId(userId),
    });

    if (existingParticipant) {
      // 이미 존재하면 색상 업데이트
      await db.collection("participants").updateOne(
        { _id: new ObjectId(chatRoomId), "participants.userId": new ObjectId(userId) },
        { $set: { "participants.$.color": color } }
      );
    } else {
      // 존재하지 않으면 배열에 추가
      await db.collection("participants").updateOne(
        { _id: new ObjectId(chatRoomId) },
        {
          $push: {
            participants: {
              userId: new ObjectId(userId),
              color: color,
            },
          },
        }
      );
    }

    console.log("색상 업데이트 성공:", result);
    return res.status(200).json({ message: "Color updated successfully." });
  } catch (error) {
    console.error("Error handling update color:", error);
    res.status(500).json({ message: "Error handling update color." });
  }
}
