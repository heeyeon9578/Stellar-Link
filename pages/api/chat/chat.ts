import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/util/database";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { ObjectId } from "mongodb";

/**
 * 채팅 목록 가져오기
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
    const { type } = req.query;

    if (!type || typeof type !== "string") {
      return res.status(400).json({ message: "Invalid type" });
    }
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const client = await connectDB;
    const db = client.db("StellarLink");
    const collection = db.collection("messages");

    const currentUserId = session.user.id;
    console.log("Current User ID:", currentUserId);

    let filter: any = {
      participants: { $in: [new ObjectId(currentUserId)] },
    };

    // 채팅 타입에 따라 필터 추가
    switch (type) {
      case "All":
        break;
      case "Personal":
        filter.type = "personal";
        break;
      case "Teams":
        filter.type = "teams";
        break;
      default:
        return res.status(400).json({ message: "Invalid type value" });
    }

    const chats = await collection.find(filter).toArray();

    // if (!chats || chats.length === 0) {
    //   return res.status(404).json({ message: "No chats found" });
    // }

    // 모든 참여자 ID와 메시지 보낸 사람 ID 수집
    const allParticipantIds = new Set<string>();
    const lastMessageSenderIds = new Set<string>();

    chats.forEach(chat => {
      chat.participants.forEach((id: ObjectId) => allParticipantIds.add(id.toString()));
      if (chat.messages.length > 0) {
        const lastMessage = chat.messages[chat.messages.length - 1];
        lastMessageSenderIds.add(lastMessage.requesterId);
      }
    });

    const userIdsToFetch = Array.from(new Set([...allParticipantIds, ...lastMessageSenderIds])).map(id => new ObjectId(id));

    // 사용자 정보 조회
    const users = await db
      .collection("user_cred")
      .find({ _id: { $in: userIdsToFetch } })
      .toArray();

    const userMap = users.reduce((acc: any, user: any) => {
      acc[user._id.toString()] = {
        id: user._id,
        name: user.name || "Unknown User",
        email: user.email || "Unknown Email",
        profileImage: user.profileImage || "/SVG/default-profile.svg",
      };
      return acc;
    }, {});

    // 채팅방과 마지막 메시지에 사용자 정보 매핑
    const enrichedChats = chats.map(chat => {
      const lastMessage = chat.messages.length > 0 ? chat.messages[chat.messages.length - 1] : null;
      const lastMessageWithSender = lastMessage
        ? {
            ...lastMessage,
            senderInfo: userMap[lastMessage.requesterId] || { id: lastMessage.requesterId, name: "Unknown User" },
          }
        : null;

      return {
        ...chat,
        participants: chat.participants
          .filter((id: ObjectId) => id.toString() !== currentUserId.toString())
          .map((id: ObjectId) => userMap[id.toString()] || { id, name: "Unknown User" }),
        messages: lastMessageWithSender ? [lastMessageWithSender] : [],
      };
    });

    res.status(200).json(enrichedChats);
  } catch (error: unknown) {
    console.error("Error fetching chats:", error);

    // if (error instanceof Error) {
    //   res.status(500).json({ message: "Error fetching chats", error: error.message });
    // } else {
    //   res.status(500).json({ message: "Unknown error occurred" });
    // }
  }
}