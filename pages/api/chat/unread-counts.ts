import { connectDB } from "@/util/database";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { ObjectId } from "mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
      if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed" });
      }
  
      const session = await getServerSession(req, res, authOptions);
  
      if (!session) {
        return res.status(401).json({ message: "Unauthorized" });
      }
  
      const userId = session?.user.id;
      if (!userId) {
        return res.status(400).json({ message: "Invalid user" });
      }
  
      const client = await connectDB;
      const db = client.db("StellarLink");
      
      const chatRooms = await db.collection("messages").aggregate([
        {
            $match: {
              participants: new ObjectId(userId),
            },
          },
          {
            $project: {
              _id: 1,
              title: 1,
              unreadCount: {
                $size: {
                  $filter: {
                    input: "$messages",
                    as: "message",
                    cond: {
                      $and: [
                        { $not: { $in: [new ObjectId(userId), { $ifNull: ["$$message.readBy", []] }] } },
                        { $ne: ["$$message.requesterId", new ObjectId(userId)] }, // 자신이 보낸 메시지 제외
                      ],
                    },
                  },
                },
              },
            },
          },
      ]).toArray();
  
      res.status(200).json(chatRooms);
    } catch (error) {
      console.error("Error in /api/chat/unread-counts:", error); // 오류 로그 추가
      res.status(500).json({ message: "Error fetching unread counts" });
    }
  }
  
