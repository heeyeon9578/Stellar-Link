import { connectDB } from "@/util/database";
import { ObjectId } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../pages/api/auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const client = await connectDB;
  const db = client.db("StellarLink");
  const { userId } = req.query;

  // 인증된 사용자 가져오기
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // 사용자 데이터 가져오기
    const user = await db.collection("user_cred").findOne({ _id: new ObjectId(userId?.toString()) });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // theme 데이터 반환
    const theme = user.theme || {};
    res.status(200).json({
      top: theme.top || "#01012B",
      middle: theme.middle || "#02025B",
      bottom: theme.bottom || "#030391",
    });
  } catch (error) {
    console.error("Error fetching user theme:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
