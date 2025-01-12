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
  file?: {
    name: string;
    type: string;
    data?: string; // 클라이언트에서 전송
    url?: string;  // 서버에서 추가
  };
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
          console.error("User not found in database");
          socket.emit("error", { message: "User not found in database" }); // 클라이언트로 에러 전송
          return;
        }
        console.log(`

          requester


          `,requester)
        const requesterId = requester._id?.toString() || "Unknown";
        const requesterName = requester.name?.toString() || "Unknown User";
        const requesterImage = requester.profileImage?.toString() || "/SVG/default-profile.svg";
        const requesterEmail = requester.email?.toString() || "Unknown Email";
        const id = new ObjectId();

        const messageData = {
          id: id,
          ...data,
          requesterId,
          // requesterName:requesterName,
          // requesterImage:requesterImage,
          createdAt: new Date(),
          readBy: [new ObjectId(requesterId)], // Add sender to `readBy`
        };

        // 파일 처리 (URL만 포함하는 방식)
        if (data.file?.url) {
          messageData.file = {
            name: data.file.name,
            type: data.file.type,
            url: data.file.url, // 클라이언트에서 전달된 URL 사용
          };
        }

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
          id: id,
          requesterId,
          requesterName,
          requesterEmail,
          requesterImage,
          createdAt: new Date(),
          readBy: [new ObjectId(requesterId)], // Add sender to `readBy`
        };
    
        console.log("Message received:", message);
          // 메시지 브로드캐스트
        //io?.to(data.chatRoomId).emit("receive_message", message);
        io?.emit("receive_message", message);
      });

       // 메시지 읽음 이벤트
       socket.on("mark_as_read", async ({ chatRoomId, userId }) => {
        try {
          const client = await connectDB;
          const db = client.db("StellarLink");
        
          await db.collection("messages").updateOne(
            { _id: new ObjectId(chatRoomId) },
            {
              $addToSet: {
                "messages.$[elem].readBy": new ObjectId(userId),
              },
            },
            {
              arrayFilters: [{ "elem.readBy": { $ne: new ObjectId(userId) } }],
            }
          );
          
        
          // 읽음 업데이트를 같은 채팅방 사용자들에게 브로드캐스트
          io?.emit("update_read_status", { chatRoomId, userId });
        } catch (error) {
          console.error("Error in mark_as_read:", error);
        }
      });
      
      socket.on("disconnect", () => {

      });
    });
  } else {
    console.log("Socket.io server already running.");
  }

  res.end();
}