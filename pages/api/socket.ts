import { Server as IOServer, Socket } from "socket.io";
import { NextApiRequest, NextApiResponse } from "next";
import { Server as HTTPServer } from "http";
import { connectDB } from "@/util/database";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";
import { ObjectId } from "mongodb";

type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: HTTPServer & {
      io?: IOServer;
    };
  };
};

interface ChatMessage {
  chatRoomId: string;
  senderEmail: string;
  text: string;

}

let io: IOServer | undefined;

export default async function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (!res.socket.server.io) {
    console.log(`

      
      Socket.io server starting...
      

      
      `);
 
    io = new IOServer(res.socket.server, {
      cors: {
        origin: "http://localhost:3000", // 클라이언트 URL
        methods: ["GET", "POST"],
        credentials: true, // 쿠키 인증을 사용하는 경우 설정 필요
      },
      path: "/api/socket", // 경로 설정
    });
    res.socket.server.io = io;

    io.on("connection", async (socket: Socket) => {
      console.log(`

        A user connected:
        
        
        `, socket.id);
      
      socket.on("disconnect", () => {
        console.log(`

          User disconnected: 

          
          ${socket.id}`);
      });

      const client = await connectDB;
      const db = client.db("StellarLink");

      
      // Join a room
      socket.on("join_room", (room: string) => {
        socket.join(room);
  
      });

      // Handle incoming messages
      socket.on("send_message", async(data: ChatMessage) => {

      //const requesterEmail = session.user?.email;
      const requester = await db.collection("user_cred").findOne({ email: data.senderEmail });

      if (!requester) {
        console.log("User not found in database");
        socket.disconnect();
        return;
      }

      const requesterId = requester._id.toString(); // 사용자 ID를 문자열로 저장
      const requesterName = requester.name.toString();
      const requesterImage = requester.profileImage.toString();
      const requesterEmail = requester.email.toString();
        
      const messageData = {
        ...data,
        requesterId:requesterId,
        // requesterName:requesterName,
        // requesterImage:requesterImage,
        createdAt: new Date(),
      };
        
    
        // 메시지 추가 또는 새 채팅방 생성
        await db.collection("messages").updateOne(
          { _id: new ObjectId(data.chatRoomId)}, // 검색 조건
          {
            $push: { messages: messageData }, // messages 배열에 새 메시지 추가
            // $setOnInsert: { chatRoomId: data.chatRoomId }, // 채팅방이 없을 경우 생성
          },
          // { upsert: true } // 채팅방이 없을 경우 새로 생성
        );

        const message = {
          ...data,
          requesterId:requesterId,
          requesterName:requesterName,
          requesterEmail: requesterEmail,
          requesterImage:requesterImage,
          createdAt: new Date(),
        };
        console.log("Message received:", message);
          // 메시지 브로드캐스트
        io?.to(data.chatRoomId).emit("receive_message", message);
      });

      socket.on("disconnect", () => {

      });
    });
  } else {
    console.log("Socket.io server already running.");
  }

  res.end();
}